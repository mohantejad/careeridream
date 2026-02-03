from django.contrib import admin

from .models import SavedDraft


@admin.register(SavedDraft)
class SavedDraftAdmin(admin.ModelAdmin):
    list_display = ('user', 'draft_type', 'job_title', 'company', 'updated_at')
    search_fields = ('user__email', 'job_title', 'company')
    list_filter = ('draft_type',)
