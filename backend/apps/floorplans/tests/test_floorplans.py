"""Tests for the floor plans module."""
import json
import re

import pytest
from accounts.tests.factories import PASSWORD, AdminFactory, UserFactory
from django.core.files.uploadedfile import SimpleUploadedFile
from floorplans.models import Building, FloorPlan
from rest_framework import status
from rest_framework.test import APIClient

BUILDINGS_URL = "/api/floorplans/buildings/"
FLOOR_PLANS_URL = "/api/floorplans/floor-plans/"

PDF_MINIMAL = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n"

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


def pdf(name="plan.pdf"):
    return SimpleUploadedFile(name, PDF_MINIMAL, content_type="application/pdf")


def make_building(**overrides):
    kwargs = {"name": "CEA Building", "code": "CEA"}
    kwargs.update(overrides)
    return kwargs


def make_floor_plan(building, **overrides):
    kwargs = {"building": building.id, "floor_label": "1st Floor", "file": pdf()}
    kwargs.update(overrides)
    return kwargs


# ---------------------------------------------------------------------------
# Buildings
# ---------------------------------------------------------------------------

class TestBuildings:
    def test_public_list_is_open(self, api_client):
        Building.objects.create(**make_building())
        response = api_client.get(BUILDINGS_URL)
        assert response.status_code == status.HTTP_200_OK
        names = [b["name"] for b in env(response)["data"]["results"]]
        assert names == ["CEA Building"]

    def test_public_list_hides_inactive(self, api_client):
        Building.objects.create(**make_building())
        Building.objects.create(**make_building(name="Closed", is_active=False))
        response = api_client.get(BUILDINGS_URL)
        names = [b["name"] for b in env(response)["data"]["results"]]
        assert names == ["CEA Building"]

    def test_detail_includes_floor_plans(self, api_client, admin_user):
        building = Building.objects.create(**make_building())
        FloorPlan.objects.create(building=building, floor_label="1st Floor", file=pdf())
        response = api_client.get(f"{BUILDINGS_URL}{building.id}/")
        assert response.status_code == status.HTTP_200_OK
        data = env(response)["data"]
        assert data["floor_plans"][0]["floor_label"] == "1st Floor"
        assert re.search(r"/media/floorplans/floors/[0-9a-f]{32}\.pdf$", data["floor_plans"][0]["file"])

    def test_detail_hides_inactive_floor_plans(self, api_client, admin_user):
        building = Building.objects.create(**make_building())
        FloorPlan.objects.create(building=building, floor_label="1st Floor", file=pdf())
        FloorPlan.objects.create(
            building=building, floor_label="2nd Floor", file=pdf(), is_active=False
        )
        response = api_client.get(f"{BUILDINGS_URL}{building.id}/")
        labels = [f["floor_label"] for f in env(response)["data"]["floor_plans"]]
        assert labels == ["1st Floor"]

    def test_admin_can_create_building(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        response = api_client.post(BUILDINGS_URL, make_building(), format="json", **headers)
        assert response.status_code == status.HTTP_201_CREATED

    def test_officer_cannot_create(self, api_client, officer):
        headers = auth_headers(api_client, officer)
        response = api_client.post(BUILDINGS_URL, make_building(), format="json", **headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN


# ---------------------------------------------------------------------------
# Floor plans
# ---------------------------------------------------------------------------

class TestFloorPlans:
    def test_admin_can_upload_floor_plan(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        building = Building.objects.create(**make_building())
        response = api_client.post(
            FLOOR_PLANS_URL, make_floor_plan(building), format="multipart", **headers
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = env(response)["data"]
        assert data["floor_label"] == "1st Floor"
        assert re.search(r"/media/floorplans/floors/[0-9a-f]{32}\.pdf$", data["file"])

    def test_duplicate_floor_rejected(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        building = Building.objects.create(**make_building())
        api_client.post(FLOOR_PLANS_URL, make_floor_plan(building), format="multipart", **headers)
        response = api_client.post(
            FLOOR_PLANS_URL, make_floor_plan(building), format="multipart", **headers
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_rejects_non_pdf(self, api_client, admin_user):
        headers = auth_headers(api_client, admin_user)
        building = Building.objects.create(**make_building())
        png = SimpleUploadedFile(
            "plan.png", bytes.fromhex("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c626001000000ffff03000006000557bfabd40000000049454e44ae426082"),
            content_type="image/png",
        )
        response = api_client.post(
            FLOOR_PLANS_URL,
            {"building": building.id, "floor_label": "GF", "file": png},
            format="multipart",
            **headers,
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_anonymous_can_read_but_not_manage(self, api_client):
        building = Building.objects.create(**make_building())
        FloorPlan.objects.create(building=building, floor_label="GF", file=pdf())
        response = api_client.get(FLOOR_PLANS_URL)
        assert response.status_code == status.HTTP_200_OK
        response = api_client.post(FLOOR_PLANS_URL, make_floor_plan(building), format="multipart")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
