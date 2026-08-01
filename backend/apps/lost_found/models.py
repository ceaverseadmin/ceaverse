"""Lost & Found module — public reports with tracking codes."""
import secrets
import string
import uuid

from common.upload import UploadToPath
from common.validators import validate_image
from django.db import models


def _generate_tracking_code():
    suffix = "".join(
        secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8)
    )
    return f"LF-{suffix}"


class LostFoundItem(models.Model):
    """A reported lost or found item, trackable via a unique code."""

    class ItemType(models.TextChoices):
        LOST = "lost", "Lost"
        FOUND = "found", "Found"

    class Category(models.TextChoices):
        ID_CARD = "id_card", "ID Card"
        WALLET = "wallet", "Wallet"
        GADGET = "gadget", "Gadget"
        BOOK = "book", "Book"
        CLOTHING = "clothing", "Clothing"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        MATCHED = "matched", "Matched"
        RESOLVED = "resolved", "Resolved"
        CLOSED = "closed", "Closed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item_type = models.CharField(max_length=10, choices=ItemType.choices)
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.OTHER
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    date = models.DateField(null=True, blank=True)
    image = models.ImageField(
        upload_to=UploadToPath("lost_found"),
        blank=True,
        null=True,
        validators=[validate_image],
    )
    contact_name = models.CharField(max_length=120, blank=True)
    contact_email = models.EmailField(blank=True)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.OPEN
    )
    tracking_code = models.CharField(
        max_length=12, unique=True, default=_generate_tracking_code, editable=False
    )
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["item_type", "status"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"{self.get_item_type_display()} · {self.title}"
