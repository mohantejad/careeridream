'''Profile data models for user resumes and onboarding details.'''

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


# Max upload size for resumes (in bytes).
MAX_RESUME_SIZE = 5 * 1024 * 1024

def validate_resume_size(value):
    # Enforce a hard size limit on uploaded resume files.
    if value and value.size > MAX_RESUME_SIZE:
        raise ValidationError('Resume file size must be 5MB or less.')

class UserProfile(models.Model):
    '''Primary profile record for each user.'''
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
        blank=True,
        null=True,
    )
    headline = models.CharField(max_length=180, blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=180, blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    profile_completeness = models.PositiveSmallIntegerField(
        default=0,
        blank=True,
        null=True,
    )
    # Optional resume upload with size validation.
    resume_file = models.FileField(
        upload_to='resumes/',
        blank=True,
        null=True,
        validators=[validate_resume_size],
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def update_profile_completeness(self) -> int:
        '''Recompute and persist a simple weighted completeness score.'''
        score = 0
        if self.headline:
            score += 10
        if self.summary:
            score += 10
        if self.location:
            score += 10
        if self.resume_file:
            score += 15
        if self.skills.exists():
            score += 15
        if self.experiences.exists():
            score += 20
        if self.educations.exists():
            score += 10
        if self.certifications.exists() or self.achievements.exists():
            score += 10

        self.profile_completeness = min(score, 100)
        self.save(update_fields=['profile_completeness'])
        return self.profile_completeness

    def __str__(self) -> str:
        email = getattr(self.user, 'email', None) or 'unknown'
        return f'{email} profile'


class Skill(models.Model):
    '''Skill entry linked to a profile.'''
    class Proficiency(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        ADVANCED = 'advanced', 'Advanced'
        EXPERT = 'expert', 'Expert'

    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='skills',
        blank=True,
        null=True,
    )
    name = models.CharField(max_length=120, blank=True, null=True)
    proficiency = models.CharField(
        max_length=20,
        choices=Proficiency.choices,
        blank=True,
        null=True,
    )
    order = models.PositiveSmallIntegerField(default=0, blank=True, null=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self) -> str:
        email = getattr(getattr(self.profile, 'user', None), 'email', None) or 'unknown'
        name = self.name or 'unnamed'
        return f'{email} - {name}'


class Experience(models.Model):
    '''Work experience entry linked to a profile.'''
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='experiences',
        blank=True,
        null=True,
    )
    company = models.CharField(max_length=180, blank=True, null=True)
    title = models.CharField(max_length=180, blank=True, null=True)
    location = models.CharField(max_length=180, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveSmallIntegerField(default=0, blank=True, null=True)

    class Meta:
        ordering = ['order', '-start_date', 'id']

    def __str__(self) -> str:
        email = getattr(getattr(self.profile, 'user', None), 'email', None) or 'unknown'
        title = self.title or 'untitled'
        return f'{email} - {title}'


class Education(models.Model):
    '''Education entry linked to a profile.'''
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='educations',
        blank=True,
        null=True,
    )
    school = models.CharField(max_length=180, blank=True, null=True)
    degree = models.CharField(max_length=180, blank=True, null=True)
    field_of_study = models.CharField(max_length=180, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveSmallIntegerField(default=0, blank=True, null=True)

    class Meta:
        ordering = ['order', '-start_date', 'id']

    def __str__(self) -> str:
        email = getattr(getattr(self.profile, 'user', None), 'email', None) or 'unknown'
        school = self.school or 'unknown school'
        return f'{email} - {school}'


class Certification(models.Model):
    '''Certification entry linked to a profile.'''
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='certifications',
        blank=True,
        null=True,
    )
    name = models.CharField(max_length=180, blank=True, null=True)
    issuer = models.CharField(max_length=180, blank=True, null=True)
    issue_date = models.DateField(blank=True, null=True)
    expiration_date = models.DateField(blank=True, null=True)
    credential_url = models.URLField(blank=True, null=True)
    order = models.PositiveSmallIntegerField(default=0, blank=True, null=True)

    class Meta:
        ordering = ['order', '-issue_date', 'id']

    def __str__(self) -> str:
        email = getattr(getattr(self.profile, 'user', None), 'email', None) or 'unknown'
        name = self.name or 'unnamed'
        return f'{email} - {name}'


class Achievement(models.Model):
    '''Achievement entry linked to a profile.'''
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='achievements',
        blank=True,
        null=True,
    )
    title = models.CharField(max_length=180, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    order = models.PositiveSmallIntegerField(default=0, blank=True, null=True)

    class Meta:
        ordering = ['order', '-date', 'id']

    def __str__(self) -> str:
        email = getattr(getattr(self.profile, 'user', None), 'email', None) or 'unknown'
        title = self.title or 'untitled'
        return f'{email} - {title}'
