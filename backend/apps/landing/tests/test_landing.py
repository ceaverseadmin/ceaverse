"""Tests for the landing page module."""
import json
import re

import pytest
from accounts.tests.factories import PASSWORD, AdminFactory, SuperAdminFactory, UserFactory
from django.core.files.uploadedfile import SimpleUploadedFile
from landing.models import DownloadableLink, Hero, ServiceCard
from rest_framework import status
from rest_framework.test import APIClient

CONTENT_URL = "/api/landing/content/"
HERO_URL = "/api/landing/sections/hero/"
ABOUT_URL = "/api/landing/sections/about/"
MISSION_URL = "/api/landing/sections/mission/"
VISION_URL = "/api/landing/sections/vision/"
CONTACT_URL = "/api/landing/sections/contact/"
SERVICE_CARDS_URL = "/api/landing/service-cards/"
DOWNLOADABLE_LINKS_URL = "/api/landing/downloadable-links/"

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


# ---------------------------------------------------------------------------
# Public content
# ---------------------------------------------------------------------------

class TestLandingContent:
    def test_public_content_is_open(self, api_client):
        response = api_client.get(CONTENT_URL)
        assert response.status_code == status.HTTP_200_OK
        payload = env(response)
        assert payload["success"] is True
        data = payload["data"]
        for section in ("hero", "about", "mission", "vision", "contact"):
            assert section in data
        assert data["service_cards"] == []
        assert data["downloadable_links"] == []

    def test_content_includes_active_items(self, api_client, admin_user):
        ServiceCard.objects.create(title="Ebooks", order=1)
        ServiceCard.objects.create(title="Hidden", is_active=False)
        response = api_client.get(CONTENT_URL)
        data = env(response)["data"]
        titles = [card["title"] for card in data["service_cards"]]
        assert titles == ["Ebooks"]

    def test_hero_serializes_fields(self, api_client, admin_user):
        Hero.objects.create(title="Welcome")
        response = api_client.get(CONTENT_URL)
        hero = env(response)["data"]["hero"]
        assert hero["title"] == "Welcome"


# ---------------------------------------------------------------------------
# Singleton sections
# ---------------------------------------------------------------------------

class TestSingletonSections:
    def test_admin_can_update_hero(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        response = api_client.patch(
            HERO_URL, {"title": "EA-CSC Portal"}, format="json", **headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert env(response)["data"]["title"] == "EA-CSC Portal"
        assert Hero.objects.count() == 1

    def test_singleton_always_has_single_row(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        api_client.patch(HERO_URL, {"title": "A"}, format="json", **headers)
        api_client.patch(HERO_URL, {"title": "B"}, format="json", **headers)
        hero = Hero.objects.get()
        assert hero.pk == 1
        assert hero.title == "B"

    def test_get_creates_default_section(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        response = api_client.get(HERO_URL, **headers)
        assert response.status_code == status.HTTP_200_OK
        assert Hero.objects.count() == 1

    def test_officer_cannot_update(self, api_client, officer):
        headers = auth_headers(api_client, officer)
        response = api_client.patch(
            HERO_URL, {"title": "Nope"}, format="json", **headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_cannot_update(self, api_client):
        response = api_client.patch(HERO_URL, {"title": "Nope"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_all_section_endpoints_exist(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        for url in (ABOUT_URL, MISSION_URL, VISION_URL, CONTACT_URL):
            assert api_client.get(url, **headers).status_code == status.HTTP_200_OK


# ---------------------------------------------------------------------------
# Service cards
# ---------------------------------------------------------------------------

class TestServiceCards:
    def test_admin_can_create(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        response = api_client.post(
            SERVICE_CARDS_URL,
            {"title": "Ebooks", "icon": "book", "order": 1},
            format="json",
            **headers,
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert env(response)["data"]["title"] == "Ebooks"

    def test_officer_cannot_create(self, api_client, officer):
        headers = auth_headers(api_client, officer)
        response = api_client.post(
            SERVICE_CARDS_URL, {"title": "Nope"}, format="json", **headers
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_cannot_list(self, api_client):
        assert api_client.get(SERVICE_CARDS_URL).status_code == status.HTTP_401_UNAUTHORIZED

    def test_orders_by_order(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        ServiceCard.objects.create(title="Second", order=2)
        ServiceCard.objects.create(title="First", order=1)
        response = api_client.get(SERVICE_CARDS_URL, **headers)
        titles = [card["title"] for card in env(response)["data"]["results"]]
        assert titles == ["First", "Second"]


# ---------------------------------------------------------------------------
# Downloadable links
# ---------------------------------------------------------------------------

class TestDownloadableLinks:
    def test_requires_file_or_url(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        response = api_client.post(
            DOWNLOADABLE_LINKS_URL,
            {"label": "Brochure"},
            format="json",
            **headers,
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_accepts_external_url(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        response = api_client.post(
            DOWNLOADABLE_LINKS_URL,
            {"label": "Portal", "external_url": "https://ea-csc.example"},
            format="json",
            **headers,
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_accepts_pdf_upload(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        pdf = SimpleUploadedFile("handbook.pdf", PDF_MINIMAL, content_type="application/pdf")
        response = api_client.post(
            DOWNLOADABLE_LINKS_URL,
            {"label": "Handbook", "file": pdf},
            format="multipart",
            **headers,
        )
        assert response.status_code == status.HTTP_201_CREATED
        file_url = env(response)["data"]["file"]
        assert file_url.endswith(".pdf")
        assert re.search(r"/media/landing/downloads/[0-9a-f]{32}\.pdf$", file_url)

    def test_uploaded_file_uses_unique_name(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        pdf = SimpleUploadedFile("handbook.pdf", PDF_MINIMAL, content_type="application/pdf")
        api_client.post(
            DOWNLOADABLE_LINKS_URL,
            {"label": "Handbook", "file": pdf},
            format="multipart",
            **headers,
        )
        stored = DownloadableLink.objects.get().file.name
        assert re.fullmatch(r"landing/downloads/[0-9a-f]{32}\.pdf", stored)

    def test_rejects_non_pdf(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        png = SimpleUploadedFile("cover.png", PNG_1PX, content_type="image/png")
        response = api_client.post(
            DOWNLOADABLE_LINKS_URL,
            {"label": "Cover", "file": png},
            format="multipart",
            **headers,
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_download_cleanup(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        pdf = SimpleUploadedFile("handbook.pdf", PDF_MINIMAL, content_type="application/pdf")
        create = api_client.post(
            DOWNLOADABLE_LINKS_URL,
            {"label": "Handbook", "file": pdf},
            format="multipart",
            **headers,
        )
        link_id = env(create)["data"]["id"]
        response = api_client.delete(
            f"{DOWNLOADABLE_LINKS_URL}{link_id}/", **headers
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert DownloadableLink.objects.count() == 0
