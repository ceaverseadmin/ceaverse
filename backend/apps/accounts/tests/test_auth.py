import json
import uuid

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from .factories import PASSWORD, AdminFactory, SuperAdminFactory, UserFactory

User = get_user_model()

LOGIN_URL = "/api/auth/login/"
REFRESH_URL = "/api/auth/refresh/"
LOGOUT_URL = "/api/auth/logout/"
ME_URL = "/api/auth/me/"
USERS_URL = "/api/users/"
ACTIVITY_LOGS_URL = "/api/activity-logs/"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def super_admin():
    return SuperAdminFactory.create()


@pytest.fixture
def admin_user():
    return AdminFactory.create()


@pytest.fixture
def officer():
    return UserFactory.create()


def login(client, email, password=PASSWORD):
    return client.post(LOGIN_URL, {"email": email, "password": password}, format="json")


def env(response):
    """Parse the rendered response body (the standard envelope)."""
    return json.loads(response.content.decode("utf-8"))


def auth_headers(tokens):
    return {"HTTP_AUTHORIZATION": f"Bearer {tokens['access']}"}


@pytest.fixture
def super_tokens(api_client, super_admin):
    response = login(api_client, super_admin.email)
    assert response.status_code == status.HTTP_200_OK
    return env(response)["data"]


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

def test_login_returns_tokens_and_user(api_client, super_admin):
    response = login(api_client, super_admin.email)
    assert response.status_code == status.HTTP_200_OK
    payload = env(response)
    assert payload["success"] is True
    data = payload["data"]
    assert "access" in data
    assert "refresh" in data
    assert data["user"]["email"] == super_admin.email
    assert data["user"]["role"] == User.Role.SUPER_ADMIN


def test_login_rejects_wrong_password(api_client, super_admin):
    response = login(api_client, super_admin.email, "wrong-password")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert env(response)["success"] is False
    assert env(response)["errors"] is not None


def test_login_rate_limited(api_client, super_admin):
    for _ in range(10):
        login(api_client, super_admin.email)
    response = login(api_client, super_admin.email)
    assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_refresh_rotates_tokens(api_client, super_admin):
    tokens = env(login(api_client, super_admin.email))["data"]
    response = api_client.post(
        REFRESH_URL, {"refresh": tokens["refresh"]}, format="json"
    )
    assert response.status_code == status.HTTP_200_OK
    rotated = env(response)["data"]
    assert "access" in rotated
    assert "refresh" in rotated
    assert rotated["refresh"] != tokens["refresh"]


def test_logout_blacklists_refresh_token(api_client, super_admin):
    tokens = env(login(api_client, super_admin.email))["data"]
    logout = api_client.post(
        LOGOUT_URL, {"refresh": tokens["refresh"]}, format="json",
        **auth_headers(tokens),
    )
    assert logout.status_code == status.HTTP_200_OK

    response = api_client.post(
        REFRESH_URL, {"refresh": tokens["refresh"]}, format="json"
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_me_requires_authentication(api_client):
    response = api_client.get(ME_URL)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert env(response)["success"] is False


def test_me_returns_current_user(api_client, super_admin):
    tokens = env(login(api_client, super_admin.email))["data"]
    response = api_client.get(ME_URL, **auth_headers(tokens))
    assert response.status_code == status.HTTP_200_OK
    assert env(response)["data"]["email"] == super_admin.email


def test_login_creates_activity_log(super_admin):
    client = APIClient()
    login(client, super_admin.email)
    from accounts.models import ActivityLog

    assert ActivityLog.objects.filter(
        user=super_admin, action=ActivityLog.Action.LOGIN
    ).exists()


# ---------------------------------------------------------------------------
# User management (RBAC)
# ---------------------------------------------------------------------------

def test_list_users_forbidden_for_officer(api_client, officer):
    tokens = env(login(api_client, officer.email))["data"]
    response = api_client.get(USERS_URL, **auth_headers(tokens))
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_users_forbidden_for_admin(api_client, admin_user):
    tokens = env(login(api_client, admin_user.email))["data"]
    response = api_client.get(USERS_URL, **auth_headers(tokens))
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_list_users_allowed_for_super_admin(api_client, super_admin, admin_user):
    tokens = env(login(api_client, super_admin.email))["data"]
    response = api_client.get(USERS_URL, **auth_headers(tokens))
    assert response.status_code == status.HTTP_200_OK
    emails = [u["email"] for u in env(response)["data"]["results"]]
    assert super_admin.email in emails
    assert admin_user.email in emails


def test_create_user_syncs_staff_flag(api_client, super_admin):
    tokens = env(login(api_client, super_admin.email))["data"]
    response = api_client.post(
        USERS_URL,
        {
            "email": "new-admin@ea-csc.test",
            "full_name": "New Admin",
            "role": User.Role.ADMIN,
            "password": "StrongPass123!",
        },
        format="json",
        **auth_headers(tokens),
    )
    assert response.status_code == status.HTTP_201_CREATED
    user = User.objects.get(email="new-admin@ea-csc.test")
    assert user.role == User.Role.ADMIN
    assert user.is_staff is True


def test_create_user_validation_error_envelope(api_client, super_admin):
    tokens = env(login(api_client, super_admin.email))["data"]
    response = api_client.post(
        USERS_URL,
        {"email": "not-an-email", "password": "short"},
        format="json",
        **auth_headers(tokens),
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    payload = env(response)
    assert payload["success"] is False
    assert "email" in payload["errors"]


def test_cannot_delete_own_account(api_client, super_admin):
    tokens = env(login(api_client, super_admin.email))["data"]
    response = api_client.delete(
        f"{USERS_URL}{super_admin.id}/", **auth_headers(tokens)
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert User.objects.filter(id=super_admin.id).exists()


def test_cannot_delete_last_super_admin(api_client, super_admin, admin_user):
    tokens = env(login(api_client, super_admin.email))["data"]
    response = api_client.delete(
        f"{USERS_URL}{super_admin.id}/", **auth_headers(tokens)
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_reset_password(api_client, super_admin, admin_user):
    tokens = env(login(api_client, super_admin.email))["data"]
    response = api_client.post(
        f"{USERS_URL}{admin_user.id}/reset_password/",
        {"new_password": "NewPass123!"},
        format="json",
        **auth_headers(tokens),
    )
    assert response.status_code == status.HTTP_200_OK
    admin_user.refresh_from_db()
    assert admin_user.check_password("NewPass123!")


def test_detail_not_found_returns_envelope_404(api_client, super_admin):
    tokens = env(login(api_client, super_admin.email))["data"]
    response = api_client.get(
        f"{USERS_URL}{uuid.uuid4()}/", **auth_headers(tokens)
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert env(response)["success"] is False


# ---------------------------------------------------------------------------
# Activity logs
# ---------------------------------------------------------------------------

def test_activity_logs_require_super_admin(api_client, admin_user):
    tokens = env(login(api_client, admin_user.email))["data"]
    response = api_client.get(ACTIVITY_LOGS_URL, **auth_headers(tokens))
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_activity_logs_visible_to_super_admin(api_client, super_admin):
    tokens = env(login(api_client, super_admin.email))["data"]
    response = api_client.get(ACTIVITY_LOGS_URL, **auth_headers(tokens))
    assert response.status_code == status.HTTP_200_OK
    actions = {log["action"] for log in env(response)["data"]["results"]}
    assert "login" in actions
