from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication


class CustomJWTAuthentication(JWTAuthentication):
    # Accept JWTs from either Authorization header or auth cookies.
    def authenticate(self, request):
        try:
            # Prefer Authorization header if present; otherwise fall back to cookie.
            header = self.get_header(request)
            if header is None:
                raw_token = request.COOKIES.get(settings.AUTH_COOKIE)
            else:
                raw_token = self.get_raw_token(header)
                
            if raw_token is None:
                return None 
            
            # Validate the token and resolve the user.
            validated_token = self.get_validated_token(raw_token)

            return self.get_user(validated_token), validated_token
        except Exception:
            # Swallow auth errors to allow anonymous access where permitted.
            return None
