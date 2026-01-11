from .views import CustomTokenObtainPairView, CustomTokenRefreshView, CustomTokenVerifyView, LogoutView, CustomProviderAuthView
from django.urls import path, re_path

urlpatterns = [
    re_path(
        r'^o/(?P<provider>\S+)/$',
        CustomProviderAuthView.as_view(),
        name='provider-auth'
    ),
    path('jwt/create/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('jwt/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('jwt/verify/', CustomTokenVerifyView.as_view(), name='token_verify'),
    path('logout/', LogoutView.as_view(), name='token_logout'),
]
