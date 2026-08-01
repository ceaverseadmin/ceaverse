from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .audit import log_action
from .models import ActivityLog
from .permissions import IsSuperAdmin
from .serializers import (
    ActivityLogSerializer,
    CreateUserSerializer,
    EmailTokenObtainPairSerializer,
    ResetPasswordSerializer,
    UpdateUserSerializer,
    UserSerializer,
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "login"

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            user = User.objects.filter(email=request.data.get("email")).first()
            log_action(
                user,
                ActivityLog.Action.LOGIN,
                model_name="User",
                details={"email": request.data.get("email")},
                request=request,
            )
        return response


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {
                    "success": False,
                    "message": "refresh token is required.",
                    "data": None,
                    "errors": {"refresh": ["This field is required."]},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {
                    "success": False,
                    "message": "Invalid or already revoked refresh token.",
                    "data": None,
                    "errors": None,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        log_action(request.user, ActivityLog.Action.LOGOUT, model_name="User", request=request)
        return Response(
            {
                "success": True,
                "message": "Logged out successfully.",
                "data": None,
                "errors": None,
            }
        )


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response(
            {
                "success": True,
                "message": None,
                "data": UserSerializer(request.user).data,
                "errors": None,
            }
        )


class UserViewSet(viewsets.ModelViewSet):
    """Admin user management — super admins only."""

    queryset = User.objects.all().order_by("-created_at")
    permission_classes = (IsSuperAdmin,)
    http_method_names = ["get", "post", "patch", "delete"]
    search_fields = ["email", "full_name"]
    filterset_fields = ["role", "is_active"]
    ordering_fields = ["created_at", "email", "full_name"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateUserSerializer
        if self.action in ("update", "partial_update"):
            return UpdateUserSerializer
        return UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        log_action(
            self.request.user,
            ActivityLog.Action.CREATE,
            model_name="User",
            object_id=user.id,
            request=self.request,
        )

    def perform_update(self, serializer):
        user = serializer.save()
        log_action(
            self.request.user,
            ActivityLog.Action.UPDATE,
            model_name="User",
            object_id=user.id,
            request=self.request,
        )

    def perform_destroy(self, instance):
        if instance.id == self.request.user.id:
            raise PermissionDenied("You cannot delete your own account.")
        if instance.is_super_admin:
            super_admin_count = User.objects.filter(role=User.Role.SUPER_ADMIN).count()
            if super_admin_count <= 1:
                raise PermissionDenied("Cannot delete the last super admin.")
        log_action(
            self.request.user,
            ActivityLog.Action.DELETE,
            model_name="User",
            object_id=instance.id,
            request=self.request,
        )
        instance.delete()

    @action(detail=True, methods=["post"])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        log_action(
            request.user,
            ActivityLog.Action.UPDATE,
            model_name="User",
            object_id=user.id,
            details={"action": "reset_password"},
            request=request,
        )
        return Response(
            {
                "success": True,
                "message": "Password reset successfully.",
                "data": None,
                "errors": None,
            }
        )


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Audit trail — super admins only."""

    queryset = ActivityLog.objects.select_related("user").all()
    serializer_class = ActivityLogSerializer
    permission_classes = (IsSuperAdmin,)
    filterset_fields = ["action", "model_name", "user"]
    search_fields = ["model_name", "object_id", "details"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]
