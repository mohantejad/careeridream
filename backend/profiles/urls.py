'''Profile API routes.'''

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AchievementViewSet,
    CertificationViewSet,
    EducationViewSet,
    ExperienceViewSet,
    SkillViewSet,
    UserProfileViewSet,
)

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='profile')
router.register(r'skills', SkillViewSet, basename='skills')
router.register(r'experiences', ExperienceViewSet, basename='experiences')
router.register(r'educations', EducationViewSet, basename='educations')
router.register(r'certifications', CertificationViewSet, basename='certifications')
router.register(r'achievements', AchievementViewSet, basename='achievements')

urlpatterns = [
    path('', include(router.urls)),
]
