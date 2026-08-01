"""Landing page serializers.

DRF FileField/ImageField serialise to absolute URLs (using the request
context), so file-backed models expose ready-to-use URLs without extra fields.
"""
from common.validators import validate_image, validate_pdf
from rest_framework import serializers

from .models import (
    AboutSection,
    ContactSection,
    DownloadableLink,
    Hero,
    MissionSection,
    ServiceCard,
    VisionSection,
)


class HeroSerializer(serializers.ModelSerializer):
    background_image = serializers.ImageField(
        required=False,
        allow_null=True,
        validators=[validate_image],
    )

    class Meta:
        model = Hero
        fields = [
            "title",
            "subtitle",
            "background_image",
            "cta_label",
            "cta_url",
            "is_active",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


class AboutSectionSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        required=False,
        allow_null=True,
        validators=[validate_image],
    )

    class Meta:
        model = AboutSection
        fields = ["title", "content", "image", "updated_at"]
        read_only_fields = ["updated_at"]


class MissionSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MissionSection
        fields = ["content", "updated_at"]
        read_only_fields = ["updated_at"]


class VisionSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisionSection
        fields = ["content", "updated_at"]
        read_only_fields = ["updated_at"]


class ContactSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSection
        fields = [
            "email",
            "phone",
            "address",
            "map_link",
            "working_hours",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


class ServiceCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCard
        fields = ["id", "icon", "title", "description", "order", "is_active"]
        read_only_fields = ["id"]


class DownloadableLinkSerializer(serializers.ModelSerializer):
    file = serializers.FileField(
        required=False,
        allow_null=True,
        validators=[validate_pdf],
    )

    class Meta:
        model = DownloadableLink
        fields = [
            "id",
            "label",
            "description",
            "file",
            "external_url",
            "order",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        file = attrs.get("file", getattr(self.instance, "file", None))
        external_url = attrs.get(
            "external_url", getattr(self.instance, "external_url", "")
        )
        if not file and not external_url:
            raise serializers.ValidationError(
                "Provide either a file or an external URL."
            )
        return attrs


class LandingContentSerializer(serializers.Serializer):
    hero = HeroSerializer()
    about = AboutSectionSerializer()
    mission = MissionSectionSerializer()
    vision = VisionSectionSerializer()
    contact = ContactSectionSerializer()
    service_cards = ServiceCardSerializer(many=True)
    downloadable_links = DownloadableLinkSerializer(many=True)
