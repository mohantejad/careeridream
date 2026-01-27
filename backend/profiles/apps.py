"""Profiles app configuration."""

from django.apps import AppConfig


class ProfilesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "profiles"

    def ready(self) -> None:
        """Register profile signals on startup."""
        import profiles.signals  # noqa: F401
