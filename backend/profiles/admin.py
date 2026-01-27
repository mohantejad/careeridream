"""Admin registrations for profile models."""

from django.contrib import admin

from .models import Achievement, Certification, Education, Experience, Skill, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "profile_completeness", "updated_at")
    search_fields = ("user__email", "headline", "location")


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("profile", "name", "proficiency", "order")
    search_fields = ("profile__user__email", "name")


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("profile", "title", "company", "start_date", "end_date")
    search_fields = ("profile__user__email", "company", "title")


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ("profile", "school", "degree", "start_date", "end_date")
    search_fields = ("profile__user__email", "school", "degree")


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ("profile", "name", "issuer", "issue_date")
    search_fields = ("profile__user__email", "name", "issuer")


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("profile", "title", "date")
    search_fields = ("profile__user__email", "title")
