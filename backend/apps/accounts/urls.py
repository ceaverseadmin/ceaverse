from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ActivityLogViewSet,
    ApproveUserView,
    LoginView,
    LogoutView,
    MeView,
    PendingUsersView,
    SignupView,
    UserViewSet,
)

router = DefaultRouter()
router.register("users", UserViewSet, basename="users")
router.register("activity-logs", ActivityLogViewSet, basename="activity-logs")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/signup/", SignupView.as_view(), name="auth-signup"),
    path("users/pending/", PendingUsersView.as_view(), name="pending-users"),
    path("users/<uuid:pk>/approve/", ApproveUserView.as_view(), name="approve-user"),
    path("", include(router.urls)),
]
