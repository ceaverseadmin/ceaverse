"""Floor plan serializers."""
from common.validators import validate_image, validate_pdf
from rest_framework import serializers

from .models import Building, FloorPlan


class FloorPlanSerializer(serializers.ModelSerializer):
    file = serializers.FileField(validators=[validate_pdf])

    class Meta:
        model = FloorPlan
        fields = ["id", "building", "floor_label", "file", "order", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class FloorPlanNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = FloorPlan
        fields = ["id", "floor_label", "file", "order"]
        read_only_fields = fields


class BuildingSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        required=False,
        allow_null=True,
        validators=[validate_image],
    )

    class Meta:
        model = Building
        fields = ["id", "name", "code", "description", "image", "order", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class BuildingDetailSerializer(BuildingSerializer):
    floor_plans = serializers.SerializerMethodField()

    class Meta(BuildingSerializer.Meta):
        fields = [*BuildingSerializer.Meta.fields, "floor_plans"]

    def get_floor_plans(self, obj):
        user = getattr(self.context.get("request"), "user", None)
        queryset = obj.floor_plans.all()
        if not (user and user.is_authenticated and user.is_administrator):
            queryset = queryset.filter(is_active=True)
        return FloorPlanNestedSerializer(queryset, many=True).data
