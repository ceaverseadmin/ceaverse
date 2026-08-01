"""Tests for the ebooks module."""
import json
import re

import pytest
from accounts.tests.factories import PASSWORD, AdminFactory, SuperAdminFactory, UserFactory
from django.core.files.uploadedfile import SimpleUploadedFile
from ebooks.models import Book
from rest_framework import status
from rest_framework.test import APIClient

BOOKS_URL = "/api/ebooks/"

PNG_1PX = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d49444154789c626001000000ffff03000006000557"
    "bfabd40000000049454e44ae426082"
)
PDF_MINIMAL = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n"

LOGIN_URL = "/api/auth/login/"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user():
    return AdminFactory.create()


@pytest.fixture
def super_admin():
    return SuperAdminFactory.create()


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


def make_book(**kwargs):
    kwargs.setdefault("title", "Strength of Materials")
    kwargs.setdefault("file", SimpleUploadedFile("book.pdf", PDF_MINIMAL, content_type="application/pdf"))
    return kwargs


# ---------------------------------------------------------------------------
# Public catalog
# ---------------------------------------------------------------------------

class TestPublicCatalog:
    def test_list_is_open_to_anyone(self, api_client, admin_user):
        Book.objects.create(title="Math", file=SimpleUploadedFile("m.pdf", PDF_MINIMAL, content_type="application/pdf"))
        response = api_client.get(BOOKS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert env(response)["success"] is True

    def test_list_hides_inactive(self, api_client, admin_user):
        Book.objects.create(title="Public", file=SimpleUploadedFile("a.pdf", PDF_MINIMAL, content_type="application/pdf"))
        Book.objects.create(
            title="Hidden",
            is_active=False,
            file=SimpleUploadedFile("b.pdf", PDF_MINIMAL, content_type="application/pdf"),
        )
        response = api_client.get(BOOKS_URL)
        titles = [b["title"] for b in env(response)["data"]["results"]]
        assert titles == ["Public"]

    def test_detail_of_inactive_is_hidden(self, api_client, admin_user):
        book = Book.objects.create(
            title="Hidden",
            is_active=False,
            file=SimpleUploadedFile("b.pdf", PDF_MINIMAL, content_type="application/pdf"),
        )
        response = api_client.get(f"{BOOKS_URL}{book.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# Admin management
# ---------------------------------------------------------------------------

class TestAdminManagement:
    def test_admin_can_create_book(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        payload = make_book()
        response = api_client.post(BOOKS_URL, payload, format="multipart", **headers)
        assert response.status_code == status.HTTP_201_CREATED
        data = env(response)["data"]
        assert data["title"] == "Strength of Materials"
        assert re.search(r"/media/ebooks/files/[0-9a-f]{32}\.pdf$", data["file"])
        assert Book.objects.count() == 1

    def test_admin_can_update_book(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        book = Book.objects.create(title="Old", file=SimpleUploadedFile("o.pdf", PDF_MINIMAL, content_type="application/pdf"))
        response = api_client.patch(
            f"{BOOKS_URL}{book.id}/", {"title": "New"}, format="json", **headers
        )
        assert response.status_code == status.HTTP_200_OK
        book.refresh_from_db()
        assert book.title == "New"

    def test_admin_can_delete_book(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        book = Book.objects.create(title="Gone", file=SimpleUploadedFile("g.pdf", PDF_MINIMAL, content_type="application/pdf"))
        response = api_client.delete(f"{BOOKS_URL}{book.id}/", **headers)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Book.objects.filter(id=book.id).exists()

    def test_officer_cannot_create(self, api_client, officer):
        headers = auth_headers(api_client, officer)
        response = api_client.post(BOOKS_URL, make_book(), format="multipart", **headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_cannot_create(self, api_client):
        response = api_client.post(BOOKS_URL, make_book(), format="multipart")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_rejects_non_pdf(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        png = SimpleUploadedFile("book.png", PNG_1PX, content_type="image/png")
        response = api_client.post(
            BOOKS_URL,
            {"title": "Bad", "file": png},
            format="multipart",
            **headers,
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_filter_by_category(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        Book.objects.create(
            title="Ref", category=Book.Category.REFERENCE,
            file=SimpleUploadedFile("r.pdf", PDF_MINIMAL, content_type="application/pdf"),
        )
        response = api_client.get(BOOKS_URL, {"category": "reference"}, **headers)
        titles = [b["title"] for b in env(response)["data"]["results"]]
        assert titles == ["Ref"]
