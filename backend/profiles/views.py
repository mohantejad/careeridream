'''Profile APIs for managing user profile data and related collections.'''

import json
from io import BytesIO
from os import getenv

from django.db import transaction
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import (
    Achievement,
    Certification,
    Education,
    Experience,
    Skill,
    UserProfile,
    MAX_RESUME_SIZE,
)
from .serializers import (
    AchievementSerializer,
    CertificationSerializer,
    EducationSerializer,
    ExperienceSerializer,
    SkillSerializer,
    UserProfileDetailSerializer,
    UserProfileSerializer,
)


GROQ_API_KEY = getenv('GROQ_API_KEY')
GROQ_MODEL = getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')

def truncate_text(text: str, max_chars: int) -> str:
    return text[:max_chars] if text and len(text) > max_chars else text

def strip_code_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        # remove first line (``` or ```json)
        text = text.split("\n", 1)[1] if "\n" in text else ""
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    return text.strip()

def build_profile_payload(profile: UserProfile) -> dict:
    data = UserProfileDetailSerializer(profile).data
    # Remove fields not needed for generation.
    data.pop('id', None)
    data.pop('profile_completeness', None)
    data.pop('updated_at', None)
    data.pop('resume_file', None)
    return data

def call_groq(system_prompt: str, user_content: str, model: str) -> dict:
    try:
        import requests
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {GROQ_API_KEY}',
            },
            json={
                'model': model,
                'temperature': 0.2,
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_content},
                ],
            },
            timeout=60,
        )
    except Exception as exc:
        return {'error': f'Groq request failed: {exc}', 'status': status.HTTP_502_BAD_GATEWAY}

    if response.status_code >= 400:
        return {
            'error': 'Groq API error.',
            'status': status.HTTP_502_BAD_GATEWAY,
        }

    data = response.json()
    content = (
        data.get('choices', [{}])[0]
        .get('message', {})
        .get('content', '')
    )
    return {'content': content}


class UserProfileViewSet(viewsets.ModelViewSet):
    '''CRUD for the current user's profile with helper endpoints.'''
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def _get_profile_or_404(self, request):
        # Centralized helper to fetch the current user's profile.
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            return None
        return profile

    def get_queryset(self):
        '''Restrict profile access to the current user.'''
        return UserProfile.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        '''Recalculate completeness after profile updates.'''
        profile = serializer.save()
        profile.update_profile_completeness()

    @action(detail=False, methods=['get'])
    def me(self, request):
        '''Return the current user's profile without needing an ID.'''
        profile = self._get_profile_or_404(request)
        if not profile:
            return Response({'detail': 'Profile not found.'}, status=404)
        serializer = UserProfileDetailSerializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_me(self, request):
        '''Update the current user's profile without needing an ID.'''
        profile = self._get_profile_or_404(request)
        if not profile:
            return Response({'detail': 'Profile not found.'}, status=404)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        profile.update_profile_completeness()
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def onboarding(self, request):
        '''Return onboarding status derived from profile completeness.'''
        profile = self._get_profile_or_404(request)
        if not profile:
            return Response({'detail': 'Profile not found.'}, status=404)
        return Response(
            {
                'profile_completeness': profile.profile_completeness,
                'needs_onboarding': profile.profile_completeness < 30,
            }
        )

    @action(detail=False, methods=['post'])
    def onboarding_submit(self, request):
        '''Submit full onboarding payload in one request.'''
        profile = self._get_profile_or_404(request)
        if not profile:
            return Response({'detail': 'Profile not found.'}, status=404)

        def parse_payload(value):
            # Accept JSON strings or Python structures from multipart requests.
            if value is None:
                return None
            if isinstance(value, str):
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return None
            return value

        profile_payload = parse_payload(request.data.get('profile'))
        skills_payload = parse_payload(request.data.get('skills'))
        experiences_payload = parse_payload(request.data.get('experiences'))
        educations_payload = parse_payload(request.data.get('educations'))
        certifications_payload = parse_payload(request.data.get('certifications'))
        achievements_payload = parse_payload(request.data.get('achievements'))

        resume_file = request.FILES.get('resume_file')
        if resume_file:
            profile_payload['resume_file'] = resume_file

        with transaction.atomic():
            # Only update sections present in the request to avoid accidental data loss.
            if profile_payload is not None:
                profile_serializer = self.get_serializer(
                    profile, data=profile_payload, partial=True
                )
                profile_serializer.is_valid(raise_exception=True)
                profile_serializer.save()

            if skills_payload is not None:
                skills_serializer = SkillSerializer(data=skills_payload, many=True)
                skills_serializer.is_valid(raise_exception=True)
                Skill.objects.filter(profile=profile).delete()
                skills_serializer.save(profile=profile)

            if experiences_payload is not None:
                experiences_serializer = ExperienceSerializer(
                    data=experiences_payload, many=True
                )
                experiences_serializer.is_valid(raise_exception=True)
                Experience.objects.filter(profile=profile).delete()
                experiences_serializer.save(profile=profile)

            if educations_payload is not None:
                educations_serializer = EducationSerializer(
                    data=educations_payload, many=True
                )
                educations_serializer.is_valid(raise_exception=True)
                Education.objects.filter(profile=profile).delete()
                educations_serializer.save(profile=profile)

            if certifications_payload is not None:
                certifications_serializer = CertificationSerializer(
                    data=certifications_payload, many=True
                )
                certifications_serializer.is_valid(raise_exception=True)
                Certification.objects.filter(profile=profile).delete()
                certifications_serializer.save(profile=profile)

            if achievements_payload is not None:
                achievements_serializer = AchievementSerializer(
                    data=achievements_payload, many=True
                )
                achievements_serializer.is_valid(raise_exception=True)
                Achievement.objects.filter(profile=profile).delete()
                achievements_serializer.save(profile=profile)

            profile.update_profile_completeness()

        return Response(
            {
                'profile': UserProfileSerializer(profile).data,
                'skills_count': Skill.objects.filter(profile=profile).count(),
                'experiences_count': Experience.objects.filter(profile=profile).count(),
                'educations_count': Education.objects.filter(profile=profile).count(),
                'certifications_count': Certification.objects.filter(profile=profile).count(),
                'achievements_count': Achievement.objects.filter(profile=profile).count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'])
    def parse_resume(self, request):
        '''Accept a resume file and return parsed fields (LLM integration stub).'''
        resume_file = request.FILES.get('resume_file')
        if not resume_file:
            return Response({'detail': 'resume_file is required.'}, status=400)

        api_key = GROQ_API_KEY
        model = GROQ_MODEL
        allowed_mime_types = {
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }

        if not api_key:
            return Response(
                {'detail': 'GROQ_API_KEY is not configured.'},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

        if resume_file.size > MAX_RESUME_SIZE:
            return Response(
                {'detail': 'Resume file exceeds 5MB limit.'},
                status=400,
            )
        if resume_file.content_type not in allowed_mime_types:
            return Response(
                {'detail': 'Unsupported resume file type.'},
                status=400,
            )

        # Extract plain text from the resume before sending to the LLM.
        resume_text = ''
        file_bytes = resume_file.read()
        file_stream = BytesIO(file_bytes)
        try:
            if resume_file.content_type == 'application/pdf':
                from pypdf import PdfReader
                reader = PdfReader(file_stream)
                resume_text = '\n'.join(
                    page.extract_text() or '' for page in reader.pages
                ).strip()
            else:
                from docx import Document
                doc = Document(file_stream)
                resume_text = '\n'.join(
                    para.text for para in doc.paragraphs if para.text
                ).strip()
        except Exception as exc:
            return Response(
                {'detail': f'Unable to read resume file: {exc}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not resume_text:
            return Response(
                {'detail': 'Resume text could not be extracted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Limit prompt size to avoid oversized requests.
        max_chars = 12000
        if len(resume_text) > max_chars:
            resume_text = resume_text[:max_chars]

        system_prompt = (
            'You are a resume parser. Extract structured data from the resume.\n'
            'Return STRICT JSON only (no markdown). Keys:\n'
            'profile, skills, experiences, educations, certifications, achievements.\n'
            'Use this schema:\n'
            'profile: {headline, summary, location, phone, email}\n'
            'skills: [{name, proficiency, order}]\n'
            'experiences: [{company, title, location, start_date, end_date, is_current, description, order}]\n'
            'educations: [{school, degree, field_of_study, start_date, end_date, description, order}]\n'
            'certifications: [{name, issuer, issue_date, expiration_date, credential_url, order}]\n'
            'achievements: [{title, description, date, order}]\n'
            'If a field is missing, use empty string, null, or empty list.'
        )

        request_payload = {
            'model': model,
            'temperature': 0.2,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': resume_text},
            ],
        }

        try:
            import requests

            # Call Groq API to parse resume content into structured JSON.
            response = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {api_key}',
                },
                json=request_payload,
                timeout=60,
            )
        except Exception as exc:
            return Response(
                {'detail': f'Groq request failed: {exc}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if response.status_code >= 400:
            return Response(
                {
                    'detail': 'Groq API error.',
                    'status_code': response.status_code,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        data = response.json()
        text = (
            data.get('choices', [{}])[0]
            .get('message', {})
            .get('content', '')
        )

        try:
            clean = strip_code_fences(text)
            parsed = json.loads(clean)
        except json.JSONDecodeError:
            return Response(
                {
                    'detail': 'Model output was not valid JSON.',
                    'raw_output': text,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(parsed, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def generate_resume(self, request):
        '''Generate a structured resume draft from profile + job description.'''
        profile = self._get_profile_or_404(request)
        if not profile:
            return Response({'detail': 'Profile not found.'}, status=404)

        jd_text = (request.data.get('job_description') or '').strip()
        if not jd_text:
            return Response({'detail': 'job_description is required.'}, status=400)

        if not GROQ_API_KEY:
            return Response(
                {'detail': 'GROQ_API_KEY is not configured.'},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

        template_style = (request.data.get('template_style') or 'modern').strip()
        profile_payload = build_profile_payload(profile)
        jd_text = truncate_text(jd_text, 6000)

        system_prompt = (
            'You are a resume writer and evaluator. Use the profile data and job description to craft a tailored resume.\n'
            'Return STRICT JSON only (no markdown). Use this schema:\n'
            '{\n'
            '  "headline": string,\n'
            '  "summary": string,\n'
            '  "skills": [string],\n'
            '  "experiences": [\n'
            '    {\n'
            '      "company": string,\n'
            '      "title": string,\n'
            '      "location": string,\n'
            '      "start_date": string,\n'
            '      "end_date": string|null,\n'
            '      "is_current": boolean,\n'
            '      "bullets": [string]\n'
            '    }\n'
            '  ],\n'
            '  "education": [\n'
            '    {"school": string, "degree": string, "field_of_study": string, "start_date": string|null, "end_date": string|null}\n'
            '  ],\n'
            '  "certifications": [string],\n'
            '  "achievements": [string],\n'
            '  "fit_score": number,\n'
            '  "strengths": [string],\n'
            '  "weaknesses": [string]\n'
            '}\n'
            'fit_score must be 0-100. strengths/weaknesses should each be at most 2 items.\n'
            f'Template style: {template_style}. Prioritize relevance to the job description.'
        )

        user_content = json.dumps(
            {'profile': profile_payload, 'job_description': jd_text},
            ensure_ascii=False,
        )

        result = call_groq(system_prompt, user_content, GROQ_MODEL)
        if 'error' in result:
            return Response({'detail': result['error']}, status=result['status'])

        text = strip_code_fences(result.get('content', ''))
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            return Response(
                {'detail': 'Model output was not valid JSON.', 'raw_output': text},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(parsed, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def generate_cover_letter(self, request):
        '''Generate a structured cover letter draft from profile + job description.'''
        profile = self._get_profile_or_404(request)
        if not profile:
            return Response({'detail': 'Profile not found.'}, status=404)

        jd_text = (request.data.get('job_description') or '').strip()
        if not jd_text:
            return Response({'detail': 'job_description is required.'}, status=400)

        if not GROQ_API_KEY:
            return Response(
                {'detail': 'GROQ_API_KEY is not configured.'},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )

        template_style = (request.data.get('template_style') or 'modern').strip()
        profile_payload = build_profile_payload(profile)
        jd_text = truncate_text(jd_text, 6000)

        system_prompt = (
            'You are a cover letter writer. Use the profile data and job description to craft a tailored letter.\n'
            'Return STRICT JSON only (no markdown). Use this schema:\n'
            '{\n'
            '  "subject": string,\n'
            '  "greeting": string,\n'
            '  "body_paragraphs": [string],\n'
            '  "closing": string,\n'
            '  "signature": string\n'
            '}\n'
            f'Template style: {template_style}. Keep it concise and role-specific.'
        )

        user_content = json.dumps(
            {'profile': profile_payload, 'job_description': jd_text},
            ensure_ascii=False,
        )

        result = call_groq(system_prompt, user_content, GROQ_MODEL)
        if 'error' in result:
            return Response({'detail': result['error']}, status=result['status'])

        text = strip_code_fences(result.get('content', ''))
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            return Response(
                {'detail': 'Model output was not valid JSON.', 'raw_output': text},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(parsed, status=status.HTTP_200_OK)


class ProfileRelatedViewSet(viewsets.ModelViewSet):
    '''Base viewset for profile-related collections.'''
    permission_classes = [permissions.IsAuthenticated]
    model = None

    def get_queryset(self):
        '''Restrict access to the current user's profile.'''
        return self.model.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        '''Attach new items to the current user's profile.'''
        profile = self.request.user.profile
        serializer.save(profile=profile)
        profile.update_profile_completeness()

    def perform_update(self, serializer):
        '''Recalculate completeness after an item update.'''
        instance = serializer.save()
        instance.profile.update_profile_completeness()

    def perform_destroy(self, instance):
        '''Recalculate completeness after an item deletion.'''
        profile = instance.profile
        instance.delete()
        profile.update_profile_completeness()

    @action(detail=False, methods=['post'])
    def bulk(self, request):
        '''Replace all items for the current user in one request.'''
        profile = request.user.profile
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        self.model.objects.filter(profile=profile).delete()
        serializer.save(profile=profile)
        profile.update_profile_completeness()
        return Response(serializer.data, status=201)


class SkillViewSet(ProfileRelatedViewSet):
    '''CRUD for skills tied to the current user's profile.'''
    serializer_class = SkillSerializer
    model = Skill


class ExperienceViewSet(ProfileRelatedViewSet):
    '''CRUD for experiences tied to the current user's profile.'''
    serializer_class = ExperienceSerializer
    model = Experience


class EducationViewSet(ProfileRelatedViewSet):
    '''CRUD for education entries tied to the current user's profile.'''
    serializer_class = EducationSerializer
    model = Education


class CertificationViewSet(ProfileRelatedViewSet):
    '''CRUD for certifications tied to the current user's profile.'''
    serializer_class = CertificationSerializer
    model = Certification


class AchievementViewSet(ProfileRelatedViewSet):
    '''CRUD for achievements tied to the current user's profile.'''
    serializer_class = AchievementSerializer
    model = Achievement
