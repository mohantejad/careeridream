from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SavedDraftViewSet

router = DefaultRouter()
router.register(r'drafts', SavedDraftViewSet, basename='drafts')

urlpatterns = [
    path('', include(router.urls)),
]
