"""Lost & Found serializers."""
from common.validators import validate_image
from rest_framework import serializers

from .models import LostFoundItem


class PublicItemSerializer(serializers.ModelSerializer):
    """Serializer for the public list and detail views."""

    image = serializers.ImageField(
        required=False,
        allow_null=True,
        validators=[validate_image],
    )

    class Meta:
        model = LostFoundItem
        fields = [
            "id",
            "item_type",
            "category",
            "title",
            "description",
            "location",
            "date",
            "image",
            "contact_name",
            "contact_email",
            "status",
            "claimed_at",
            "created_at",
        ]
        read_only_fields = ["id", "status", "claimed_at", "created_at"]


class PublicCreateSerializer(PublicItemSerializer):
    """Adds submission contact fields."""

    class Meta(PublicItemSerializer.Meta):
        fields = [
            "id",
            "item_type",
            "category",
            "title",
            "description",
            "location",
            "date",
            "image",
            "contact_name",
            "contact_email",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate(self, attrs):
        email = attrs.get("contact_email")
        if email and not attrs.get("contact_name"):
            attrs["contact_name"] = email.split("@")[0]
        return attrs


class AdminItemSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        required=False,
        allow_null=True,
        validators=[validate_image],
    )

    class Meta:
        model = LostFoundItem
        fields = [
            "id",
            "item_type",
            "category",
            "title",
            "description",
            "location",
            "date",
            "image",
            "contact_name",
            "contact_email",
            "status",
            "claimed_at",
            "is_public",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "claimed_at",
            "created_at",
            "updated_at",
        ]
