"""Tests for the lost & found module."""
import json

import pytest
from accounts.tests.factories import PASSWORD, AdminFactory, UserFactory
from lost_found.models import LostFoundItem
from rest_framework import status
from rest_framework.test import APIClient

ITEMS_URL = "/api/lost-found/items/"
TRACK_URL = "/api/lost-found/track/{code}/"
ADMIN_ITEMS_URL = "/api/lost-found/admin/items/"

LOGIN_URL = "/api/auth/login/"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user():
    return AdminFactory.create()


@pytest.fixture
def officer():
    return UserFactory.create()


def login(client, email, password=PASSWORD):
    return client.post(LOGIN_URL, {"email": email, "password": password}, format="json")


def env(response):
    return json.loads(response.content.decode("utf-8"))


def auth_headers(client, user):
    response = login(client, user.email)
    assert response.status_code == status.HTTP_200_OK
    tokens = env(response)["data"]
    return {"HTTP_AUTHORIZATION": f"Bearer {tokens['access']}"}


def submit_payload(**overrides):
    payload = {
        "item_type": "found",
        "category": "wallet",
        "title": "Brown wallet near the canteen",
        "location": "Canteen",
        "contact_name": "Jane",
        "contact_email": "jane@example.com",
    }
    payload.update(overrides)
    return payload


# ---------------------------------------------------------------------------
# Public submission
# ---------------------------------------------------------------------------

class TestPublicSubmission:
    def test_submit_found_item(self, api_client):
        response = api_client.post(ITEMS_URL, submit_payload(), format="json")
        assert response.status_code == status.HTTP_201_CREATED
        payload = env(response)
        assert payload["success"] is True
        assert payload["data"]["tracking_code"].startswith("LF-")
        assert LostFoundItem.objects.count() == 1

    def test_submit_requires_item_type(self, api_client):
        payload = submit_payload()
        payload.pop("item_type")
        response = api_client.post(ITEMS_URL, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_submission_rate_limited(self, api_client):
        for _ in range(10):
            api_client.post(ITEMS_URL, submit_payload(), format="json")
        response = api_client.post(ITEMS_URL, submit_payload(), format="json")
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    def test_contact_name_defaults_from_email(self, api_client):
        payload = submit_payload(contact_name="")
        response = api_client.post(ITEMS_URL, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert LostFoundItem.objects.get().contact_name == "jane"


# ---------------------------------------------------------------------------
# Public list & tracking
# ---------------------------------------------------------------------------

class TestPublicLookup:
    def test_list_is_open(self, api_client):
        LostFoundItem.objects.create(**submit_payload())
        response = api_client.get(ITEMS_URL)
        assert response.status_code == status.HTTP_200_OK
        data = env(response)["data"]
        assert len(data) == 1
        assert "contact_email" not in data[0]
        assert "tracking_code" not in data[0]

    def test_list_hides_private_and_closed(self, api_client):
        LostFoundItem.objects.create(**submit_payload())
        LostFoundItem.objects.create(
            **submit_payload(title="Private", is_public=False)
        )
        LostFoundItem.objects.create(
            **submit_payload(title="Resolved", status=LostFoundItem.Status.RESOLVED)
        )
        response = api_client.get(ITEMS_URL)
        titles = [item["title"] for item in env(response)["data"]]
        assert titles == ["Brown wallet near the canteen"]

    def test_list_filters_by_type(self, api_client):
        LostFoundItem.objects.create(**submit_payload())
        LostFoundItem.objects.create(
            **submit_payload(item_type="lost", title="Lost calculator")
        )
        response = api_client.get(ITEMS_URL, {"item_type": "lost"})
        titles = [item["title"] for item in env(response)["data"]]
        assert titles == ["Lost calculator"]

    def test_track_returns_contact_details(self, api_client):
        item = LostFoundItem.objects.create(**submit_payload())
        response = api_client.get(TRACK_URL.format(code=item.tracking_code))
        assert response.status_code == status.HTTP_200_OK
        data = env(response)["data"]
        assert data["tracking_code"] == item.tracking_code
        assert data["contact_email"] == "jane@example.com"

    def test_track_unknown_code_404(self, api_client):
        response = api_client.get(TRACK_URL.format(code="LF-UNKNOWN"))
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# Admin management
# ---------------------------------------------------------------------------

class TestAdminManagement:
    def test_admin_can_create(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        response = api_client.post(
            ADMIN_ITEMS_URL, submit_payload(), format="json", **headers
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_admin_can_change_status(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        item = LostFoundItem.objects.create(**submit_payload())
        response = api_client.patch(
            f"{ADMIN_ITEMS_URL}{item.id}/",
            {"status": "resolved"},
            format="json",
            **headers,
        )
        assert response.status_code == status.HTTP_200_OK
        item.refresh_from_db()
        assert item.status == LostFoundItem.Status.RESOLVED

    def test_admin_status_change_is_audited(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        item = LostFoundItem.objects.create(**submit_payload())
        api_client.patch(
            f"{ADMIN_ITEMS_URL}{item.id}/",
            {"status": "matched"},
            format="json",
            **headers,
        )
        from accounts.models import ActivityLog

        assert ActivityLog.objects.filter(
            action=ActivityLog.Action.STATUS_CHANGE,
            model_name="LostFoundItem",
            object_id=str(item.id),
        ).exists()

    def test_officer_cannot_manage(self, api_client, officer):
        headers = auth_headers(api_client, officer)
        response = api_client.post(
            ADMIN_ITEMS_URL, submit_payload(), format="json", **headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_cannot_manage(self, api_client):
        response = api_client.post(ADMIN_ITEMS_URL, submit_payload(), format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
