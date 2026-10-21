"""Tests for the public API cache middleware."""
import json

import pytest
from accounts.tests.factories import PASSWORD, AdminFactory
from rest_framework import status
from rest_framework.test import APIClient

LANDING_URL = "/api/landing/content/"
EBOOKS_URL = "/api/ebooks/"
ADMIN_EBOOKS_URL = "/api/ebooks/admin/books/"
ME_URL = "/api/auth/me/"
LOGIN_URL = "/api/auth/login/"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user():
    return AdminFactory.create()


def login(client, email, password=PASSWORD):
    return client.post(LOGIN_URL, {"email": email, "password": password}, format="json")


def auth_headers(client, user):
    response = login(client, user.email)
    assert response.status_code == status.HTTP_200_OK
    tokens = json.loads(response.content.decode("utf-8"))["data"]
    return {"HTTP_AUTHORIZATION": f"Bearer {tokens['access']}"}


class TestPublicApiCache:
    def test_public_landing_content_is_cacheable(self, api_client):
        response = api_client.get(LANDING_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response["Cache-Control"] == (
            "public, max-age=60, stale-while-revalidate=300"
        )
        assert "Authorization" in response["Vary"]

    def test_public_ebook_list_is_cacheable(self, api_client):
        response = api_client.get(EBOOKS_URL)

        assert response.status_code == status.HTTP_200_OK
        assert response["Cache-Control"].startswith("public,")

    def test_conditional_get_returns_304_with_cache_headers(self, api_client):
        first = api_client.get(LANDING_URL)
        etag = first["ETag"]
        assert etag

        second = api_client.get(LANDING_URL, HTTP_IF_NONE_MATCH=etag)

        assert second.status_code == status.HTTP_304_NOT_MODIFIED
        assert second["Cache-Control"] == (
            "public, max-age=60, stale-while-revalidate=300"
        )
        assert "Authorization" in second["Vary"]

    def test_authenticated_public_read_is_not_cached(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)

        response = api_client.get(EBOOKS_URL, **headers)

        assert response.status_code == status.HTTP_200_OK
        assert "Cache-Control" not in response

    def test_admin_endpoint_is_not_cached(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)

        response = api_client.get(ADMIN_EBOOKS_URL, **headers)

        assert response.status_code == status.HTTP_200_OK
        assert "Cache-Control" not in response

    def test_auth_endpoint_is_not_cached(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)

        response = api_client.get(ME_URL, **headers)

        assert response.status_code == status.HTTP_200_OK
        assert "Cache-Control" not in response

    def test_anonymous_admin_endpoint_is_not_cached(self, api_client):
        response = api_client.get(ADMIN_EBOOKS_URL)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Cache-Control" not in response

    def test_unsafe_method_is_not_cached(self, api_client):
        response = api_client.post(LANDING_URL, {}, format="json")

        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
        assert "Cache-Control" not in response
