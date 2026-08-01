"""Student Voice views.

Students post messages without an account (rate limited); staff moderate the
queue and publish approved messages to the public wall.
"""
from accounts.audit import log_action
from accounts.models import ActivityLog
from accounts.permissions import IsAdminOrHigher
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import VoiceSubmission
from .serializers import (
    AdminVoiceSerializer,
    VoiceSubmitSerializer,
    VoiceWallSerializer,
)


class VoiceWallView(APIView):
    """Public wall of published messages and submission endpoint."""

    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "submit"

    def get(self, request):
        queryset = VoiceSubmission.objects.filter(
            status=VoiceSubmission.Status.PUBLISHED
        )
        category = request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
        serializer = VoiceWallSerializer(queryset[:50], many=True)
        return Response(
            {
                "success": True,
                "message": None,
                "data": serializer.data,
                "errors": None,
            }
        )

    def post(self, request):
        serializer = VoiceSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()
        return Response(
            {
                "success": True,
                "message": (
                    "Message received. It will appear on the wall after review."
                ),
                "data": VoiceSubmitSerializer(submission).data,
                "errors": None,
            },
            status=201,
        )


class VoiceSubmissionViewSet(viewsets.ModelViewSet):
    """Moderation queue — staff roles only."""

    queryset = VoiceSubmission.objects.all()
    serializer_class = AdminVoiceSerializer
    permission_classes = (IsAdminOrHigher,)
    http_method_names = ["get", "post", "patch", "delete"]
    filterset_fields = ["category", "status"]
    search_fields = ["content", "name"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        submission = serializer.save()
        if submission.status != old_status:
            log_action(
                self.request.user,
                ActivityLog.Action.STATUS_CHANGE,
                model_name="VoiceSubmission",
                object_id=submission.id,
                details={"from": old_status, "to": submission.status},
                request=self.request,
            )
