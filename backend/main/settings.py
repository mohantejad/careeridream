from os import getenv, path
from pathlib import Path
import sys
import dj_database_url
from django.core.management.utils import get_random_secret_key
import dotenv


BASE_DIR = Path(__file__).resolve().parent.parent

dotenv_file = BASE_DIR / '.env.local'

if path.isfile(dotenv_file):
    dotenv.load_dotenv(dotenv_file)


SECRET_KEY = getenv('DJNAGO_SECRET_KEY', get_random_secret_key())

DEBUG = getenv('DEBUG', 'True') == 'True'

DEVELOPMENT_MODE = getenv('DEVELOPMENT_MODE', 'False') == 'True'

ALLOWED_HOSTS = [
    h.strip()
    for h in getenv('DJANGO_ALLOWED_HOSTS', '127.0.0.1,localhost').split(',')
    if h.strip()
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'corsheaders',
    'djoser',
    'storages',
    'social_django',

    'users',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'main.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'main.wsgi.application'

if DEVELOPMENT_MODE is True:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': getenv('DB_NAME', 'careeridreamlocaldb'),
            'USER': getenv('DB_USER', 'careeridreamlocaluser'),
            'PASSWORD': getenv('DB_PASSWORD', 'careeridreamlocalpassword'),
            'HOST': getenv('DB_HOST', 'localhost'),
            'PORT': getenv('DB_PORT', '5432'),
        }
    }
elif len(sys.argv) > 0 and sys.argv[1] != 'collectstatic':
    if getenv('DATABASE_URL', None) is None:
        raise Exception('DATABASE_URL environment variable not set in production mode')
    DATABASES = {
        'default': dj_database_url.parse(getenv('DATABASE_URL'))
    }


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

if DEVELOPMENT_MODE:
    STATIC_URL = '/static/'
    STATIC_ROOT = BASE_DIR / 'static'
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'
else:
    # AWS_S3_ACCESS_KEY_ID = getenv('AWS_S3_ACCESS_KEY_ID')
    # AWS_S3_SECRET_ACCESS_KEY = getenv('AWS_S3_SECRET_ACCESS_KEY')
    # AWS_STORAGE_BUCKET_NAME = getenv('AWS_STORAGE_BUCKET_NAME')
    # AWS_S3_REGION_NAME = getenv('AWS_S3_REGION_NAME')
    # AWS_S3_ENDPOINT_URL = f'https://{AWS_S3_REGION_NAME}.digitaloceanspaces.com'
    # AWS_S3_OBJECT_PARAMETERS = {
    #     'CacheControl': 'max-age=86400'
    # }
    # AWS_DEFAULT_ACL = 'public-read'
    # AWS_LOCATION = 'static'
    # AWS_MEDIA_LOCATION = 'media'
    # AWS_S3_CUSTOM_DOMAIN = getenv('AWS_S3_CUSTOM_DOMAIN')
    # STORAGES = {
    #     'default': {'BACKEND': 'custom_storages.CustomS3Boto3Storage'},
    #     'staticfiles': {'BACKEND': 'storages.backends.s3boto3.S3StaticStorage'}
    # }

    # =========== Static Files with Whitenoise ===========
    STATIC_URL = '/static/'
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',   
        },
        'staticfiles': {
            'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        }
    }

EMAIL_BACKEND = getenv('EMAIL_BACKEND')
EMAIL_HOST = getenv('EMAIL_HOST')
EMAIL_PORT = getenv('EMAIL_PORT')
EMAIL_USE_TLS = getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = getenv('DEFAULT_FROM_EMAIL')

DOMAIN = getenv('DOMAIN')
SITE_NAME = 'CareerIDream'

AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
    # 'social_core.backends.facebook.FacebookOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'users.authentication.CustomJWTAuthentication',
    ],
}

DJOSER = {
    'PASSWORD_RESET_CONFIRM_URL': '/password-reset/confirm/{uid}/{token}',
    'USERNAME_RESET_CONFIRM_URL': '/username-reset/confirm/{uid}/{token}',
    'EMAIL_FRONTEND_DOMAIN': 'localhost:3000',
    'EMAIL_FRONTEND_SITE_NAME': 'CareerIDream',
    'SEND_ACTIVATION_EMAIL': True,
    'SEND_CONFIRMATION_EMAIL': True,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,
    'USERNAME_CHANGED_EMAIL_CONFIRMATION': True,
    'ACTIVATION_URL': '/users/activation/{uid}/{token}',
    'USER_CREATE_PASSWORD_RETYPE': True,
    'SET_PASSWORD_RETYPE': True,
    'SET_USERNAME_RETYPE': True,
    'PASSWORD_RESET_CONFIRM_RETYPE': True,
    'USERNAME_RESET_CONFIRM_RETYPE': True,
    'TOKEN_MODEL': None,
    # 'SERIALIZERS': {
    #     'user_create': 'users.serializers.UserCreateSerializer',
    #     'user': 'users.serializers.UserSerializer',
    #     'current_user': 'users.serializers.UserSerializer',
    # },
    'EMAIL': {
        'activation': 'users.emails.ActivationEmail',
        'confirmation': 'users.emails.ConfirmationEmail',
    },
    'SOCIAL_AUTH_ALLOWED_REDIRECT_URIS': getenv('REDIRECT_URLS').split(','),
}

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = getenv('GOOGLE_AUTH_KEY')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = getenv('GOOGLE_AUTH_SECRET')
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
]
SOCIAL_AUTH_GOOGLE_OAUTH2_EXTRA_DATA = ['first_name', 'last_name']

AUTH_COOKIE = 'access'
AUTH_COOKIE_SECURE = getenv('AUTH_COOKIE_SECURE', 'True') == 'True'
AUTH_COOKIE_SAMESITE = 'None'
AUTH_COOKIE_ACCESS_MAX_AGE = 60 * 5 
AUTH_COOKIE_REFRESH_MAX_AGE = 60 * 60 * 24
AUTH_COOKIE_HTTP_ONLY = True
AUTH_COOKIE_PATH = '/'

AUTH_USER_MODEL = 'users.UserAccount'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = getenv(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost:3000, http://127.0.0.1:3000'
).split(',')
# CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]