"""Profile APIs for managing user profile data and related collections."""

import base64
import json
from os import getenv

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Achievement, Certification, Education, Experience, Skill, UserProfile
from .serializers import (
    AchievementSerializer,
    CertificationSerializer,
    EducationSerializer,
    ExperienceSerializer,
    SkillSerializer,
    UserProfileDetailSerializer,
    UserProfileSerializer,
)


class UserProfileViewSet(viewsets.ModelViewSet):
    """CRUD for the current user's profile with helper endpoints."""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_queryset(self):
        """Restrict profile access to the current user."""
        return UserProfile.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        """Recalculate completeness after profile updates."""
        profile = serializer.save()
        profile.update_profile_completeness()

    @action(detail=False, methods=["get"])
    def me(self, request):
        """Return the current user's profile without needing an ID."""
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profile not found."}, status=404)
        serializer = UserProfileDetailSerializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=["patch"])
    def update_me(self, request):
        """Update the current user's profile without needing an ID."""
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profile not found."}, status=404)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        profile.update_profile_completeness()
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def onboarding(self, request):
        """Return onboarding status derived from profile completeness."""
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profile not found."}, status=404)
        return Response(
            {
                "profile_completeness": profile.profile_completeness,
                "needs_onboarding": profile.profile_completeness < 30,
            }
        )

    @action(detail=False, methods=["post"])
    def onboarding_submit(self, request):
        """Submit full onboarding payload in one request."""
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response({"detail": "Profile not found."}, status=404)

        def parse_payload(value, fallback):
            if value is None:
                return fallback
            if isinstance(value, str):
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return fallback
            return value

        profile_payload = parse_payload(request.data.get("profile"), {})
        skills_payload = parse_payload(request.data.get("skills"), [])
        experiences_payload = parse_payload(request.data.get("experiences"), [])
        educations_payload = parse_payload(request.data.get("educations"), [])
        certifications_payload = parse_payload(request.data.get("certifications"), [])
        achievements_payload = parse_payload(request.data.get("achievements"), [])

        resume_file = request.FILES.get("resume_file")
        if resume_file:
            profile_payload["resume_file"] = resume_file

        profile_serializer = self.get_serializer(
            profile, data=profile_payload, partial=True
        )
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()

        if skills_payload:
            skills_serializer = SkillSerializer(data=skills_payload, many=True)
            skills_serializer.is_valid(raise_exception=True)
            Skill.objects.filter(profile=profile).delete()
            skills_serializer.save(profile=profile)

        if experiences_payload:
            experiences_serializer = ExperienceSerializer(
                data=experiences_payload, many=True
            )
            experiences_serializer.is_valid(raise_exception=True)
            Experience.objects.filter(profile=profile).delete()
            experiences_serializer.save(profile=profile)

        if educations_payload:
            educations_serializer = EducationSerializer(
                data=educations_payload, many=True
            )
            educations_serializer.is_valid(raise_exception=True)
            Education.objects.filter(profile=profile).delete()
            educations_serializer.save(profile=profile)

        if certifications_payload:
            certifications_serializer = CertificationSerializer(
                data=certifications_payload, many=True
            )
            certifications_serializer.is_valid(raise_exception=True)
            Certification.objects.filter(profile=profile).delete()
            certifications_serializer.save(profile=profile)

        if achievements_payload:
            achievements_serializer = AchievementSerializer(
                data=achievements_payload, many=True
            )
            achievements_serializer.is_valid(raise_exception=True)
            Achievement.objects.filter(profile=profile).delete()
            achievements_serializer.save(profile=profile)

        profile.update_profile_completeness()

        return Response(
            {
                "profile": UserProfileSerializer(profile).data,
                "skills_count": Skill.objects.filter(profile=profile).count(),
                "experiences_count": Experience.objects.filter(profile=profile).count(),
                "educations_count": Education.objects.filter(profile=profile).count(),
                "certifications_count": Certification.objects.filter(profile=profile).count(),
                "achievements_count": Achievement.objects.filter(profile=profile).count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"])
    def parse_resume(self, request):
        """Accept a resume file and return parsed fields (LLM integration stub)."""
        resume_file = request.FILES.get("resume_file")
        if not resume_file:
            return Response({"detail": "resume_file is required."}, status=400)

        api_key = getenv("GEMINI_API_KEY")
        model = getenv("GEMINI_MODEL", "gemini-2.0-flash")

        if not api_key:
            return Response(
                {"detail": "GEMINI_API_KEY is not configured."},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

        if resume_file.size > 20 * 1024 * 1024:
            return Response(
                {"detail": "Resume file exceeds 20MB limit for inline upload."},
                status=400,
            )

        prompt_template = (
            "You are a resume parser. Extract structured data from the resume.\n"
            "Return STRICT JSON only (no markdown). Keys:\n"
            "profile, skills, experiences, educations, certifications, achievements.\n"
            "Use this schema:\n"
            "profile: {headline, summary, location, phone, email}\n"
            "skills: [{name, proficiency, order}]\n"
            "experiences: [{company, title, location, start_date, end_date, is_current, description, order}]\n"
            "educations: [{school, degree, field_of_study, start_date, end_date, description, order}]\n"
            "certifications: [{name, issuer, issue_date, expiration_date, credential_url, order}]\n"
            "achievements: [{title, description, date, order}]\n"
            "If a field is missing, use empty string, null, or empty list."
        )

        mime_type = resume_file.content_type or "application/pdf"
        file_bytes = resume_file.read()
        file_b64 = base64.b64encode(file_bytes).decode("utf-8")

        request_payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": file_b64,
                            }
                        },
                        {"text": prompt_template},
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json",
            },
        }

        try:
            import requests

            response = requests.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key,
                },
                json=request_payload,
                timeout=60,
            )
        except Exception as exc:
            return Response(
                {"detail": f"Gemini request failed: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if response.status_code >= 400:
            return Response(
                {
                    "detail": "Gemini API error.",
                    "status_code": response.status_code,
                    "response": response.text,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        data = response.json()
        text = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            return Response(
                {
                    "detail": "Model output was not valid JSON.",
                    "raw_output": text,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(parsed, status=status.HTTP_200_OK)


class SkillViewSet(viewsets.ModelViewSet):
    """CRUD for skills tied to the current user's profile."""
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Restrict skill access to the current user."""
        return Skill.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        """Attach new skills to the current user's profile."""
        profile = self.request.user.profile
        serializer.save(profile=profile)
        profile.update_profile_completeness()

    def perform_update(self, serializer):
        """Recalculate completeness after a skill update."""
        skill = serializer.save()
        skill.profile.update_profile_completeness()

    def perform_destroy(self, instance):
        """Recalculate completeness after a skill deletion."""
        profile = instance.profile
        instance.delete()
        profile.update_profile_completeness()

    @action(detail=False, methods=["post"])
    def bulk(self, request):
        """Replace all skills for the current user in one request."""
        profile = request.user.profile
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        Skill.objects.filter(profile=profile).delete()
        serializer.save(profile=profile)
        profile.update_profile_completeness()
        return Response(serializer.data, status=201)


class ExperienceViewSet(viewsets.ModelViewSet):
    """CRUD for experiences tied to the current user's profile."""
    serializer_class = ExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Restrict experience access to the current user."""
        return Experience.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        """Attach new experiences to the current user's profile."""
        profile = self.request.user.profile
        serializer.save(profile=profile)
        profile.update_profile_completeness()

    def perform_update(self, serializer):
        """Recalculate completeness after an experience update."""
        experience = serializer.save()
        experience.profile.update_profile_completeness()

    def perform_destroy(self, instance):
        """Recalculate completeness after an experience deletion."""
        profile = instance.profile
        instance.delete()
        profile.update_profile_completeness()

    @action(detail=False, methods=["post"])
    def bulk(self, request):
        """Replace all experiences for the current user in one request."""
        profile = request.user.profile
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        Experience.objects.filter(profile=profile).delete()
        serializer.save(profile=profile)
        profile.update_profile_completeness()
        return Response(serializer.data, status=201)


class EducationViewSet(viewsets.ModelViewSet):
    """CRUD for education entries tied to the current user's profile."""
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Restrict education access to the current user."""
        return Education.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        """Attach new education entries to the current user's profile."""
        profile = self.request.user.profile
        serializer.save(profile=profile)
        profile.update_profile_completeness()

    def perform_update(self, serializer):
        """Recalculate completeness after an education update."""
        education = serializer.save()
        education.profile.update_profile_completeness()

    def perform_destroy(self, instance):
        """Recalculate completeness after an education deletion."""
        profile = instance.profile
        instance.delete()
        profile.update_profile_completeness()

    @action(detail=False, methods=["post"])
    def bulk(self, request):
        """Replace all education entries for the current user in one request."""
        profile = request.user.profile
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        Education.objects.filter(profile=profile).delete()
        serializer.save(profile=profile)
        profile.update_profile_completeness()
        return Response(serializer.data, status=201)


class CertificationViewSet(viewsets.ModelViewSet):
    """CRUD for certifications tied to the current user's profile."""
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Restrict certification access to the current user."""
        return Certification.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        """Attach new certifications to the current user's profile."""
        profile = self.request.user.profile
        serializer.save(profile=profile)
        profile.update_profile_completeness()

    def perform_update(self, serializer):
        """Recalculate completeness after a certification update."""
        certification = serializer.save()
        certification.profile.update_profile_completeness()

    def perform_destroy(self, instance):
        """Recalculate completeness after a certification deletion."""
        profile = instance.profile
        instance.delete()
        profile.update_profile_completeness()

    @action(detail=False, methods=["post"])
    def bulk(self, request):
        """Replace all certifications for the current user in one request."""
        profile = request.user.profile
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        Certification.objects.filter(profile=profile).delete()
        serializer.save(profile=profile)
        profile.update_profile_completeness()
        return Response(serializer.data, status=201)


class AchievementViewSet(viewsets.ModelViewSet):
    """CRUD for achievements tied to the current user's profile."""
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Restrict achievement access to the current user."""
        return Achievement.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        """Attach new achievements to the current user's profile."""
        profile = self.request.user.profile
        serializer.save(profile=profile)
        profile.update_profile_completeness()

    def perform_update(self, serializer):
        """Recalculate completeness after an achievement update."""
        achievement = serializer.save()
        achievement.profile.update_profile_completeness()

    def perform_destroy(self, instance):
        """Recalculate completeness after an achievement deletion."""
        profile = instance.profile
        instance.delete()
        profile.update_profile_completeness()

    @action(detail=False, methods=["post"])
    def bulk(self, request):
        """Replace all achievements for the current user in one request."""
        profile = request.user.profile
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        Achievement.objects.filter(profile=profile).delete()
        serializer.save(profile=profile)
        profile.update_profile_completeness()
        return Response(serializer.data, status=201)
