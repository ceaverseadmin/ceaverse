"""Wayfinding module — searchable building and room directory."""
import uuid

from django.db import models


class RoomLocation(models.Model):
    """A searchable room or area within a campus building."""

    class Category(models.TextChoices):
        CLASSROOM = "classroom", "Classroom"
        LABORATORY = "laboratory", "Laboratory"
        OFFICE = "office", "Office"
        SERVICE = "service", "Service"
        ENTRANCE = "entrance", "Entrance"
        RESTROOM = "restroom", "Restroom"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(
        "floorplans.Building", on_delete=models.CASCADE, related_name="locations"
    )
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=20, blank=True)
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.OTHER
    )
    floor = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["building__order", "building__name", "floor", "name"]
        indexes = [
            models.Index(fields=["building", "category"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return f"{self.code or self.name} · {self.building.name}"
