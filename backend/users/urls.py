'''Auth routes for JWT and social login helpers.'''

from .views import CustomTokenObtainPairView, CustomTokenRefreshView, CustomTokenVerifyView, LogoutView, CustomProviderAuthView
from django.urls import path, re_path

urlpatterns = [
    # Social auth entry point (e.g., /o/google-oauth2/).
    re_path(
        r'^o/(?P<provider>\S+)/$',
        CustomProviderAuthView.as_view(),
        name='provider-auth'
    ),
    # JWT lifecycle endpoints using cookie-backed views.
    path('jwt/create/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('jwt/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('jwt/verify/', CustomTokenVerifyView.as_view(), name='token_verify'),
    # Logout endpoint clears auth cookies.
    path('logout/', LogoutView.as_view(), name='token_logout'),
]
