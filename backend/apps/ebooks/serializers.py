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
    file = serializers.FileField(validators=[validate_pdf])

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "author",
            "description",
            "cover",
            "file",
            "category",
            "pages",
            "is_active",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
