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
    )
    headline = models.CharField(max_length=180, blank=True)
    summary = models.TextField(blank=True)
    location = models.CharField(max_length=180, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    profile_completeness = models.PositiveSmallIntegerField(default=0)
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
        return f'{self.user.email} profile'


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
    )
    name = models.CharField(max_length=120)
    proficiency = models.CharField(
        max_length=20,
        choices=Proficiency.choices,
        blank=True,
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self) -> str:
        return f'{self.profile.user.email} - {self.name}'


class Experience(models.Model):
    '''Work experience entry linked to a profile.'''
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='experiences',
    )
    company = models.CharField(max_length=180)
    title = models.CharField(max_length=180)
    location = models.CharField(max_length=180, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', '-start_date', 'id']

    def __str__(self) -> str:
        return f'{self.profile.user.email} - {self.title}'


class Education(models.Model):
    '''Education entry linked to a profile.'''
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='educations',
    )
    school = models.CharField(max_length=180)
    degree = models.CharField(max_length=180, blank=True)
    field_of_study = models.CharField(max_length=180, blank=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', '-start_date', 'id']

    def __str__(self) -> str:
        return f'{self.profile.user.email} - {self.school}'


class Certification(models.Model):
    '''Certification entry linked to a profile.'''
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='certifications',
    )
    name = models.CharField(max_length=180)
    issuer = models.CharField(max_length=180, blank=True)
    issue_date = models.DateField(blank=True, null=True)
    expiration_date = models.DateField(blank=True, null=True)
    credential_url = models.URLField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', '-issue_date', 'id']

    def __str__(self) -> str:
        return f'{self.profile.user.email} - {self.name}'


class Achievement(models.Model):
    '''Achievement entry linked to a profile.'''
    profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name='achievements',
    )
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    date = models.DateField(blank=True, null=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', '-date', 'id']

    def __str__(self) -> str:
        return f'{self.profile.user.email} - {self.title}'
