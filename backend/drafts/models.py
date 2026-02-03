from django.conf import settings
from django.db import models


class SavedDraft(models.Model):
    class DraftType(models.TextChoices):
        RESUME = 'resume', 'Resume'
        COVER_LETTER = 'cover_letter', 'Cover letter'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_drafts',
    )
    draft_type = models.CharField(max_length=20, choices=DraftType.choices)
    job_title = models.CharField(max_length=180, blank=True)
    company = models.CharField(max_length=180, blank=True)
    summary_line = models.CharField(max_length=240, blank=True)
    job_description = models.TextField()
    template_style = models.CharField(max_length=50, default='modern')
    content = models.JSONField()
    resume_filename = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self) -> str:
        label = self.job_title or 'Draft'
        return f'{self.user.email} - {label}'
