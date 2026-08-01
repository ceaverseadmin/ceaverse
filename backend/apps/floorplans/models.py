"""CEA Floor Plans module — PDF resource directory by building and floor."""
import uuid

from common.upload import UploadToPath
from common.validators import validate_image, validate_pdf
from django.db import models


class Building(models.Model):
    """A campus building that has floor-plan PDFs."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(
        upload_to=UploadToPath("floorplans/buildings"),
        blank=True,
        null=True,
        validators=[validate_image],
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.code} · {self.name}" if self.code else self.name


class FloorPlan(models.Model):
    """A floor-level PDF plan belonging to a building."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(
        Building, on_delete=models.CASCADE, related_name="floor_plans"
    )
    floor_label = models.CharField(max_length=50)
    file = models.FileField(
        upload_to=UploadToPath("floorplans/floors"),
        validators=[validate_pdf],
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "floor_label"]
        constraints = [
            models.UniqueConstraint(
                fields=["building", "floor_label"], name="unique_floor_per_building"
            )
        ]

    def __str__(self):
        return f"{self.building.name} · {self.floor_label}"
