"""Tests for the student voice module."""
import json

import pytest
from accounts.tests.factories import PASSWORD, AdminFactory, UserFactory
from rest_framework import status
from rest_framework.test import APIClient
from student_voice.models import VoiceSubmission

WALL_URL = "/api/voice/"
ADMIN_URL = "/api/voice/admin/submissions/"

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
    payload = {"category": "suggestion", "content": "Please add more sockets."}
    payload.update(overrides)
    return payload


# ---------------------------------------------------------------------------
# Public submission
# ---------------------------------------------------------------------------

class TestPublicSubmission:
    def test_submit_message(self, api_client):
        response = api_client.post(WALL_URL, submit_payload(), format="json")
        assert response.status_code == status.HTTP_201_CREATED
        data = env(response)["data"]
        assert data["status"] == VoiceSubmission.Status.PENDING
        assert VoiceSubmission.objects.count() == 1

    def test_anonymous_by_default(self, api_client):
        api_client.post(WALL_URL, submit_payload(), format="json")
        assert VoiceSubmission.objects.get().display_name == "Anonymous"

    def test_named_submission(self, api_client):
        api_client.post(WALL_URL, submit_payload(name="Maria"), format="json")
        assert VoiceSubmission.objects.get().display_name == "Maria"

    def test_submission_rate_limited(self, api_client):
        for _ in range(10):
            api_client.post(WALL_URL, submit_payload(), format="json")
        response = api_client.post(WALL_URL, submit_payload(), format="json")
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS


# ---------------------------------------------------------------------------
# Public wall
# ---------------------------------------------------------------------------

class TestPublicWall:
    def test_wall_shows_only_published(self, api_client):
        VoiceSubmission.objects.create(**submit_payload(), status=VoiceSubmission.Status.PUBLISHED)
        VoiceSubmission.objects.create(**submit_payload(content="Pending"), status=VoiceSubmission.Status.PENDING)
        VoiceSubmission.objects.create(**submit_payload(content="Rejected"), status=VoiceSubmission.Status.REJECTED)
        response = api_client.get(WALL_URL)
        contents = [m["content"] for m in env(response)["data"]]
        assert contents == ["Please add more sockets."]

    def test_wall_hides_anonymous_name(self, api_client):
        VoiceSubmission.objects.create(
            **submit_payload(), status=VoiceSubmission.Status.PUBLISHED
        )
        response = api_client.get(WALL_URL)
        assert env(response)["data"][0]["display_name"] == "Anonymous"

    def test_wall_filters_by_category(self, api_client):
        VoiceSubmission.objects.create(**submit_payload(), status=VoiceSubmission.Status.PUBLISHED)
        VoiceSubmission.objects.create(
            **submit_payload(category="concern", content="Noise"), status=VoiceSubmission.Status.PUBLISHED
        )
        response = api_client.get(WALL_URL, {"category": "concern"})
        contents = [m["content"] for m in env(response)["data"]]
        assert contents == ["Noise"]


# ---------------------------------------------------------------------------
# Admin moderation
# ---------------------------------------------------------------------------

class TestAdminModeration:
    def test_admin_can_publish(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        submission = VoiceSubmission.objects.create(**submit_payload())
        response = api_client.patch(
            f"{ADMIN_URL}{submission.id}/",
            {"status": "published"},
            format="json",
            **headers,
        )
        assert response.status_code == status.HTTP_200_OK
        submission.refresh_from_db()
        assert submission.status == VoiceSubmission.Status.PUBLISHED

    def test_published_appears_on_wall(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        submission = VoiceSubmission.objects.create(**submit_payload())
        api_client.patch(
            f"{ADMIN_URL}{submission.id}/",
            {"status": "published"},
            format="json",
            **headers,
        )
        response = api_client.get(WALL_URL)
        assert len(env(response)["data"]) == 1

    def test_status_change_is_audited(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        submission = VoiceSubmission.objects.create(**submit_payload())
        api_client.patch(
            f"{ADMIN_URL}{submission.id}/",
            {"status": "published"},
            format="json",
            **headers,
        )
        from accounts.models import ActivityLog

        assert ActivityLog.objects.filter(
            action=ActivityLog.Action.STATUS_CHANGE,
            model_name="VoiceSubmission",
            object_id=str(submission.id),
        ).exists()

    def test_officer_cannot_moderate(self, api_client, officer):
        headers = auth_headers(api_client, officer)
        response = api_client.get(ADMIN_URL, **headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_cannot_moderate(self, api_client):
        assert api_client.get(ADMIN_URL).status_code == status.HTTP_401_UNAUTHORIZED
