"""Wayfinding views."""
from accounts.permissions import IsAdminOrReadOnly
from rest_framework import viewsets

from .models import RoomLocation
from .serializers import RoomLocationSerializer


class RoomLocationViewSet(viewsets.ModelViewSet):
    queryset = RoomLocation.objects.select_related("building").all()
    serializer_class = RoomLocationSerializer
    permission_classes = (IsAdminOrReadOnly,)
    http_method_names = ["get", "post", "patch", "delete"]
    filterset_fields = ["building", "category", "floor", "is_active"]
    search_fields = ["name", "code", "description", "building__name"]
    ordering_fields = ["floor", "name", "created_at"]
    ordering = ["building__order", "building__name", "floor", "name"]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if not (user and user.is_authenticated and user.is_administrator):
            queryset = queryset.filter(is_active=True)
        return queryset
