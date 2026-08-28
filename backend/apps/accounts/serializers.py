from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import ActivityLog, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "role",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "password", "is_active"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save(update_fields=["password"])
        return user


class UpdateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=False, validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ["email", "full_name", "role", "password", "is_active"]

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(validators=[validate_password])


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "full_name", "password", "password_confirm"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        # Create user with admin role but inactive (pending approval)
        user = User.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            password=validated_data["password"],
            role=User.Role.ADMIN,
            is_active=False,  # Requires approval
        )
        return user


class ApproveUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["is_active"]


class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "user",
            "action",
            "model_name",
            "object_id",
            "details",
            "ip_address",
            "created_at",
        ]
        read_only_fields = fields


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login serializer that returns the user alongside the token pair."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
