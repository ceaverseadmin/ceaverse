"""Ebooks module — catalog of PDF study materials."""
from common.upload import UploadToPath
from common.validators import validate_image, validate_pdf
from django.db import models


class Book(models.Model):
    """A downloadable ebook (PDF) with an optional cover image."""

    class Category(models.TextChoices):
        TEXTBOOK = "textbook", "Textbook"
        MODULE = "module", "Module"
        REFERENCE = "reference", "Reference"
        SYLLABUS = "syllabus", "Syllabus"

    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    cover = models.ImageField(
        upload_to=UploadToPath("ebooks/covers"),
        blank=True,
        null=True,
        validators=[validate_image],
    )
    file = models.FileField(
        upload_to=UploadToPath("ebooks/files"),
        validators=[validate_pdf],
    )
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.TEXTBOOK
    )
    pages = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]
        indexes = [
            models.Index(fields=["category", "is_active"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return self.title
