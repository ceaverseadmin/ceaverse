"""Tests for the dashboard module."""
import json

import pytest
from accounts.tests.factories import PASSWORD, AdminFactory, UserFactory
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from ebooks.models import Book
from lost_found.models import LostFoundItem
from rest_framework import status
from rest_framework.test import APIClient
from student_voice.models import VoiceSubmission

User = get_user_model()

SUMMARY_URL = "/api/dashboard/summary/"
LOGIN_URL = "/api/auth/login/"

PDF_MINIMAL = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n"


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


class TestDashboardSummary:
    def test_admin_can_access(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        response = api_client.get(SUMMARY_URL, **headers)
        assert response.status_code == status.HTTP_200_OK
        assert env(response)["success"] is True

    def test_counts_reflect_data(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        Book.objects.create(title="Book", file=SimpleUploadedFile("a.pdf", PDF_MINIMAL, content_type="application/pdf"))
        Book.objects.create(title="Book2", file=SimpleUploadedFile("b.pdf", PDF_MINIMAL, content_type="application/pdf"))
        LostFoundItem.objects.create(item_type="found", title="Wallet")
        LostFoundItem.objects.create(
            item_type="lost", title="Keys", status=LostFoundItem.Status.RESOLVED
        )
        VoiceSubmission.objects.create(content="Hello")
        VoiceSubmission.objects.create(
            content="World", status=VoiceSubmission.Status.PUBLISHED
        )
        response = api_client.get(SUMMARY_URL, **headers)
        counts = env(response)["data"]["counts"]
        assert counts["books"] == 2
        assert counts["lost_found"]["total"] == 2
        assert counts["lost_found"]["open"] == 1
        assert counts["lost_found"]["resolved"] == 1
        assert counts["voice"]["pending"] == 1
        assert counts["voice"]["published"] == 1

    def test_users_count(self, api_client, admin_user, officer):
        headers = auth_headers(api_client, admin_user)
        response = api_client.get(SUMMARY_URL, **headers)
        users = env(response)["data"]["counts"]["users"]
        assert users["total"] >= 2
        assert users["admins"] >= 1
        assert users["officers"] >= 1

    def test_includes_recent_activity(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        response = api_client.get(SUMMARY_URL, **headers)
        data = env(response)["data"]
        assert isinstance(data["recent_activity"], list)

    def test_officer_forbidden(self, api_client, officer):
        headers = auth_headers(api_client, officer)
        response = api_client.get(SUMMARY_URL, **headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_forbidden(self, api_client):
        assert api_client.get(SUMMARY_URL).status_code == status.HTTP_401_UNAUTHORIZED
