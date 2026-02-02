'''Custom user model and manager for authentication.'''

from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone


class UserAccountManager(BaseUserManager):
    # Manager for creating regular users and superusers with email login.
    def create_user(self, email: str, password: str | None = None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        
        # Normalize and standardize email before storing.
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        # Hashes the raw password (or marks unusable if None).
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email: str, password: str | None =None, **extra_fields):
        # Ensure elevated permissions for superusers.
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        user = self.create_user(email, password=password, **extra_fields)
        return user

class UserAccount(AbstractBaseUser, PermissionsMixin):
    # Core identity fields.
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=155, blank=True)
    last_name = models.CharField(max_length=155, blank=True)
    
    # Account status and metadata.
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    # Attach the custom manager.
    objects = UserAccountManager()

    # Use email as the unique login identifier.
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS: list[str] = []

    def __str__(self):
        return self.email
