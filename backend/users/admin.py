from django import forms
from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError

from .models import UserAccount


class UserCreationForm(forms.ModelForm):
    # Admin form to create a new user with password confirmation.

    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(
        label="Password confirmation", widget=forms.PasswordInput
    )

    class Meta:
        model = UserAccount
        fields = ["email", "first_name", "last_name"]

    def clean_password2(self):
        # Ensure the two entered passwords match.
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Hash the password before saving the user instance.
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    # Admin form to edit users; shows hashed password read-only.
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = UserAccount
        fields = ["email", "password", "first_name", "is_active", "is_staff"]


class UserAdmin(BaseUserAdmin):
    # Admin configuration for the custom UserAccount model.
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ["email", "first_name", "is_staff"]
    list_filter = ["is_staff"]
    fieldsets = [
        # Group fields in the admin detail view.
        (None, {"fields": ["email", "password"]}),
        ("Personal info", {"fields": ["first_name"]}),
        ("Permissions", {"fields": ["is_staff"]}),
    ]
    add_fieldsets = [
        (
            None,
            {
                "classes": ["wide"],
                # Fields shown on the add-user form in admin.
                "fields": ["email", "first_name", "password1", "password2"],
            },
        ),
    ]
    search_fields = ["email"]
    ordering = ["email"]
    filter_horizontal = []



admin.site.register(UserAccount, UserAdmin)
admin.site.unregister(Group)
