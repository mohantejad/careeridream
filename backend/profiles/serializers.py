"""Serializers for profile and resume-related models."""

from rest_framework import serializers

from .models import Achievement, Certification, Education, Experience, Skill, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for the main profile record."""
    class Meta:
        model = UserProfile
        fields = [
            "id",
            "headline",
            "summary",
            "location",
            "phone",
            "profile_completeness",
            "resume_file",
            "updated_at",
        ]
        read_only_fields = ["id", "profile_completeness", "updated_at"]


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for skill entries."""
    class Meta:
        model = Skill
        fields = ["id", "name", "proficiency", "order"]


class ExperienceSerializer(serializers.ModelSerializer):
    """Serializer for experience entries."""
    class Meta:
        model = Experience
        fields = [
            "id",
            "company",
            "title",
            "location",
            "start_date",
            "end_date",
            "is_current",
            "description",
            "order",
        ]


class EducationSerializer(serializers.ModelSerializer):
    """Serializer for education entries."""
    class Meta:
        model = Education
        fields = [
            "id",
            "school",
            "degree",
            "field_of_study",
            "start_date",
            "end_date",
            "description",
            "order",
        ]


class CertificationSerializer(serializers.ModelSerializer):
    """Serializer for certification entries."""
    class Meta:
        model = Certification
        fields = [
            "id",
            "name",
            "issuer",
            "issue_date",
            "expiration_date",
            "credential_url",
            "order",
        ]


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for achievement entries."""
    class Meta:
        model = Achievement
        fields = ["id", "title", "description", "date", "order"]


class UserProfileDetailSerializer(UserProfileSerializer):
    """Profile serializer including related collections."""

    skills = SkillSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    achievements = AchievementSerializer(many=True, read_only=True)

    class Meta(UserProfileSerializer.Meta):
        fields = UserProfileSerializer.Meta.fields + [
            "skills",
            "experiences",
            "educations",
            "certifications",
            "achievements",
        ]
