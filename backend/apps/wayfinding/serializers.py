"""Wayfinding serializers."""
from rest_framework import serializers

from .models import RoomLocation


class RoomLocationSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source="building.name", read_only=True)

    class Meta:
        model = RoomLocation
        fields = [
            "id",
            "building",
            "building_name",
            "name",
            "code",
            "category",
            "floor",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "building_name", "created_at", "updated_at"]
