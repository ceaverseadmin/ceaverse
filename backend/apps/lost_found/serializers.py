"""Lost & Found serializers."""
from common.validators import validate_image
from rest_framework import serializers

from .models import LostFoundItem


class PublicItemSerializer(serializers.ModelSerializer):
    """Serializer for public submission and public list views.

    Contact details and the tracking code are only revealed through the
    tracking endpoint, never on the public list.
    """

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
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]


class PublicCreateSerializer(PublicItemSerializer):
    """Adds submission contact fields, returning the tracking code."""

    class Meta(PublicItemSerializer.Meta):
        fields = [
            "id",
            "tracking_code",
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
        read_only_fields = ["id", "tracking_code", "status", "created_at"]

    def validate(self, attrs):
        email = attrs.get("contact_email")
        if email and not attrs.get("contact_name"):
            attrs["contact_name"] = email.split("@")[0]
        return attrs


class TrackItemSerializer(serializers.ModelSerializer):
    """Public status lookup — includes contact details for resolution."""

    class Meta:
        model = LostFoundItem
        fields = [
            "tracking_code",
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
            "tracking_code",
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
            "is_public",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "tracking_code", "created_at", "updated_at"]
