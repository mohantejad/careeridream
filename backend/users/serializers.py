from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()

class UserCreateSerializer(DjoserUserCreateSerializer):
    # Extend Djoser’s create serializer to control the exposed fields.
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'first_name', 'last_name', 'email') 

class UserSerializer(serializers.ModelSerializer):
    # Safe public-facing user fields (avoid exposing internal flags/passwords).
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'is_active', 'date_joined')
        
class CurrentUserSerializer(serializers.ModelSerializer):
    # Minimal profile for the current authenticated user.
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email')
