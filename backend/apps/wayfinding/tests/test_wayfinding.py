"""Tests for the wayfinding module."""
import json

import pytest
from accounts.tests.factories import PASSWORD, AdminFactory, UserFactory
from floorplans.models import Building
from rest_framework import status
from rest_framework.test import APIClient
from wayfinding.models import RoomLocation

LOCATIONS_URL = "/api/wayfinding/locations/"

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


@pytest.fixture
def building():
    return Building.objects.create(name="Engineering Building", code="ENG")


def login(client, email, password=PASSWORD):
    return client.post(LOGIN_URL, {"email": email, "password": password}, format="json")


def env(response):
    return json.loads(response.content.decode("utf-8"))


def auth_headers(client, user):
    response = login(client, user.email)
    assert response.status_code == status.HTTP_200_OK
    tokens = env(response)["data"]
    return {"HTTP_AUTHORIZATION": f"Bearer {tokens['access']}"}


def make_location(building, **overrides):
    kwargs = {
        "building": building,
        "name": "CEA Lounge",
        "code": "ENG-201",
        "category": "service",
        "floor": "2F",
    }
    kwargs.update(overrides)
    return kwargs


# ---------------------------------------------------------------------------
# Public directory
# ---------------------------------------------------------------------------

class TestPublicDirectory:
    def test_list_is_open(self, api_client, building):
        RoomLocation.objects.create(**make_location(building))
        response = api_client.get(LOCATIONS_URL)
        assert response.status_code == status.HTTP_200_OK
        names = [r["name"] for r in env(response)["data"]["results"]]
        assert names == ["CEA Lounge"]

    def test_list_hides_inactive(self, api_client, building):
        RoomLocation.objects.create(**make_location(building))
        RoomLocation.objects.create(**make_location(building, name="Closed", is_active=False))
        response = api_client.get(LOCATIONS_URL)
        names = [r["name"] for r in env(response)["data"]["results"]]
        assert names == ["CEA Lounge"]

    def test_includes_building_name(self, api_client, building):
        RoomLocation.objects.create(**make_location(building))
        response = api_client.get(LOCATIONS_URL)
        assert env(response)["data"]["results"][0]["building_name"] == "Engineering Building"

    def test_filter_by_building_and_category(self, api_client, building):
        other = Building.objects.create(name="Other", code="OTH")
        RoomLocation.objects.create(**make_location(building))
        RoomLocation.objects.create(**make_location(other, name="Other Office"))
        RoomLocation.objects.create(**make_location(building, name="Lab", category="laboratory"))
        response = api_client.get(
            LOCATIONS_URL,
            {"building": str(building.id), "category": "service"},
        )
        names = [r["name"] for r in env(response)["data"]["results"]]
        assert names == ["CEA Lounge"]

    def test_search_by_name_and_building(self, api_client, building):
        RoomLocation.objects.create(**make_location(building))
        RoomLocation.objects.create(**make_location(building, name="Dean's Office", code="ENG-101"))
        response = api_client.get(LOCATIONS_URL, {"search": "lounge"})
        names = [r["name"] for r in env(response)["data"]["results"]]
        assert names == ["CEA Lounge"]
        response = api_client.get(LOCATIONS_URL, {"search": "engineering"})
        assert len(env(response)["data"]["results"]) == 2


# ---------------------------------------------------------------------------
# Admin management
# ---------------------------------------------------------------------------

class TestAdminManagement:
    def test_admin_can_create(self, api_client, admin_user, building):
        headers = auth_headers(api_client, admin_user)
        response = api_client.post(
            LOCATIONS_URL,
            {**make_location(building), "building": building.id},
            format="json",
            **headers,
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = env(response)["data"]
        assert data["building_name"] == "Engineering Building"

    def test_admin_can_update(self, api_client, admin_user, building):
        headers = auth_headers(api_client, admin_user)
        location = RoomLocation.objects.create(**make_location(building))
        response = api_client.patch(
            f"{LOCATIONS_URL}{location.id}/",
            {"name": "CEA Student Center"},
            format="json",
            **headers,
        )
        assert response.status_code == status.HTTP_200_OK
        location.refresh_from_db()
        assert location.name == "CEA Student Center"

    def test_officer_cannot_create(self, api_client, officer, building):
        headers = auth_headers(api_client, officer)
        response = api_client.post(
            LOCATIONS_URL,
            {**make_location(building), "building": building.id},
            format="json",
            **headers,
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_cannot_create(self, api_client, building):
        response = api_client.post(
            LOCATIONS_URL,
            {**make_location(building), "building": building.id},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
