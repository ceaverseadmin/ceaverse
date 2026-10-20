"""Ebook serializers."""
from common.validators import validate_image, validate_pdf
from rest_framework import serializers

from .models import Book


class BookSerializer(serializers.ModelSerializer):
    cover = serializers.ImageField(
        required=False,
        allow_null=True,
        validators=[validate_image],
    )
    file = serializers.FileField(
        required=False,
        allow_null=True,
        validators=[validate_pdf],
    )
    url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "author",
            "description",
            "cover",
            "file",
            "url",
            "category",
            "year_level",
            "course",
            "pages",
            "is_active",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        instance = self.instance
        file = attrs.get("file", getattr(instance, "file", None))
        url = attrs.get("url", getattr(instance, "url", ""))
        if not file and not url:
            raise serializers.ValidationError("Provide a PDF file or an external URL.")
        return attrs
