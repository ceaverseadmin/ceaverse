"""Lost & Found views.

Public visitors submit reports and look them up by tracking code (rate
limited); administrators manage items and their status.
"""
from accounts.audit import log_action
from accounts.models import ActivityLog
from accounts.permissions import IsAdminOrHigher
from django.db import IntegrityError
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import LostFoundItem
from .serializers import (
    AdminItemSerializer,
    PublicCreateSerializer,
    PublicItemSerializer,
    TrackItemSerializer,
)


class PublicItemListView(APIView):
    """Public list of reports and submission of new ones."""

    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "submit"

    def get(self, request):
        queryset = LostFoundItem.objects.filter(
            is_public=True, status__in=[LostFoundItem.Status.OPEN, LostFoundItem.Status.MATCHED]
        )
        item_type = request.query_params.get("item_type")
        category = request.query_params.get("category")
        if item_type:
            queryset = queryset.filter(item_type=item_type)
        if category:
            queryset = queryset.filter(category=category)
        serializer = PublicItemSerializer(queryset[:50], many=True)
        return Response(
            {
                "success": True,
                "message": None,
                "data": serializer.data,
                "errors": None,
            }
        )

    def post(self, request):
        serializer = PublicCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            item = serializer.save()
        except IntegrityError:
            return Response(
                {
                    "success": False,
                    "message": "Could not generate a tracking code. Try again.",
                    "data": None,
                    "errors": None,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(
            {
                "success": True,
                "message": (
                    "Report received. Keep your tracking code to check the "
                    "status of your report."
                ),
                "data": PublicCreateSerializer(item).data,
                "errors": None,
            },
            status=status.HTTP_201_CREATED,
        )


class TrackItemView(APIView):
    """Public lookup of a report by tracking code."""

    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "submit"

    def get(self, request, tracking_code):
        item = LostFoundItem.objects.filter(
            tracking_code=tracking_code.upper()
        ).first()
        if item is None:
            return Response(
                {
                    "success": False,
                    "message": "No report found for that tracking code.",
                    "data": None,
                    "errors": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = TrackItemSerializer(item)
        return Response(
            {
                "success": True,
                "message": None,
                "data": serializer.data,
                "errors": None,
            }
        )


class LostFoundItemViewSet(viewsets.ModelViewSet):
    """Admin management of lost & found reports."""

    queryset = LostFoundItem.objects.all()
    serializer_class = AdminItemSerializer
    permission_classes = (IsAdminOrHigher,)
    http_method_names = ["get", "post", "patch", "delete"]
    filterset_fields = ["item_type", "category", "status", "is_public"]
    search_fields = ["title", "description", "tracking_code", "contact_email", "contact_name"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        item = serializer.save()
        if item.status != old_status:
            log_action(
                self.request.user,
                ActivityLog.Action.STATUS_CHANGE,
                model_name="LostFoundItem",
                object_id=item.id,
                details={"from": old_status, "to": item.status},
                request=self.request,
            )

    def perform_destroy(self, instance):
        log_action(
            self.request.user,
            ActivityLog.Action.DELETE,
            model_name="LostFoundItem",
            object_id=instance.id,
            request=self.request,
        )
        instance.delete()
