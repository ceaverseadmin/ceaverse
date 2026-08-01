"""Student Voice module — anonymous or named submissions, moderated by staff."""
import uuid

from django.db import models


class VoiceSubmission(models.Model):
    """A student voice message awaiting moderation."""

    class Category(models.TextChoices):
        SUGGESTION = "suggestion", "Suggestion"
        COMPLIMENT = "compliment", "Compliment"
        CONCERN = "concern", "Concern"
        SHOUTOUT = "shoutout", "Shoutout"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PUBLISHED = "published", "Published"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.SUGGESTION
    )
    content = models.TextField()
    name = models.CharField(max_length=120, blank=True)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["category", "status"]),
            models.Index(fields=["-created_at"]),
        ]

    @property
    def display_name(self):
        return self.name.strip() or "Anonymous"

    def __str__(self):
        return f"{self.get_category_display()} · {self.display_name}"
