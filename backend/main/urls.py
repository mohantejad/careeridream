from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include


def health_check(_request):
    # Lightweight health endpoint with no external dependencies.
    return HttpResponse('ok', content_type='text/plain')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('djoser.urls')),
    path('auth/', include('users.urls')),
    path('profiles/', include('profiles.urls')),
    path('drafts/', include('drafts.urls')),
    path('health/', health_check),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
