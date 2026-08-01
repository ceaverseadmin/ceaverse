"""Floor plan views."""
from accounts.permissions import IsAdminOrReadOnly
from rest_framework import viewsets

from .models import Building, FloorPlan
from .serializers import (
    BuildingDetailSerializer,
    BuildingSerializer,
    FloorPlanSerializer,
)


class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    permission_classes = (IsAdminOrReadOnly,)
    http_method_names = ["get", "post", "patch", "delete"]
    search_fields = ["name", "code", "description"]
    ordering_fields = ["order", "name", "created_at"]
    ordering = ["order", "name"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BuildingDetailSerializer
        return BuildingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not (user and user.is_authenticated and user.is_administrator):
            queryset = queryset.filter(is_active=True)
        return queryset


class FloorPlanViewSet(viewsets.ModelViewSet):
    queryset = FloorPlan.objects.all()
    serializer_class = FloorPlanSerializer
    permission_classes = (IsAdminOrReadOnly,)
    http_method_names = ["get", "post", "patch", "delete"]
    filterset_fields = ["building", "is_active"]
    ordering_fields = ["order", "floor_label", "created_at"]
    ordering = ["order", "floor_label"]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not (user and user.is_authenticated and user.is_administrator):
            queryset = queryset.filter(is_active=True)
        return queryset
