"""Landing page serializers.

DRF FileField/ImageField serialise to absolute URLs (using the request
context), so file-backed models expose ready-to-use URLs without extra fields.
"""
from common.validators import validate_image, validate_pdf
from django.core.validators import URLValidator
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


class URLOrPathField(serializers.CharField):
    """Field that accepts an absolute URL or a site-relative path.

    Link fields point to internal pages (e.g. a hero CTA to ``/library``) as
    well as external URLs, but Django's ``URLField`` requires a scheme.
    """

    url_validator = URLValidator()

    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        value = (value or "").strip()
        if value and not value.startswith("/"):
            self.url_validator(value)
        return value


class HeroSerializer(serializers.ModelSerializer):
    background_image = serializers.ImageField(
        required=False,
        allow_null=True,
        validators=[validate_image],
    )
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)
    cta_url = URLOrPathField(required=False, allow_blank=True)

    class Meta:
        model = Hero
        fields = [
            "title",
            "subtitle",
            "background_image",
            "remove_image",
            "cta_label",
            "cta_url",
            "is_active",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]

    def update(self, instance, validated_data):
        if validated_data.pop("remove_image", False) and "background_image" not in validated_data:
            if instance.background_image:
                instance.background_image.delete(save=False)
            instance.background_image = None
        return super().update(instance, validated_data)


class AboutSectionSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        required=False,
        allow_null=True,
        validators=[validate_image],
    )
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = AboutSection
        fields = ["title", "content", "image", "remove_image", "updated_at"]
        read_only_fields = ["updated_at"]

    def update(self, instance, validated_data):
        if validated_data.pop("remove_image", False) and "image" not in validated_data:
            if instance.image:
                instance.image.delete(save=False)
            instance.image = None
        return super().update(instance, validated_data)


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
    map_link = URLOrPathField(required=False, allow_blank=True)

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
