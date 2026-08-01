"""Student Voice serializers."""
from rest_framework import serializers

from .models import VoiceSubmission


class VoiceSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceSubmission
        fields = ["id", "category", "content", "name", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]


class VoiceWallSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = VoiceSubmission
        fields = ["id", "category", "content", "display_name", "created_at"]


class AdminVoiceSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = VoiceSubmission
        fields = [
            "id",
            "category",
            "content",
            "name",
            "display_name",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "display_name", "created_at", "updated_at"]
