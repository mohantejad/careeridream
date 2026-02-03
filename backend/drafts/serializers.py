from rest_framework import serializers

from .models import SavedDraft


class SavedDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedDraft
        fields = [
            'id',
            'draft_type',
            'job_title',
            'company',
            'summary_line',
            'job_description',
            'template_style',
            'content',
            'resume_filename',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
