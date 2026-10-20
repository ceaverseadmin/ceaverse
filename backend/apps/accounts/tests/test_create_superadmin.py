import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError

from .factories import PASSWORD, AdminFactory, SuperAdminFactory

User = get_user_model()

COMMAND_ENV = (
    "DJANGO_SUPERUSER_EMAIL",
    "DJANGO_SUPERUSER_PASSWORD",
    "DJANGO_SUPERUSER_FULL_NAME",
)


@pytest.fixture(autouse=True)
def clear_superuser_env(monkeypatch):
    for name in COMMAND_ENV:
        monkeypatch.delenv(name, raising=False)


def test_creates_superadmin_from_env(monkeypatch):
    monkeypatch.setenv("DJANGO_SUPERUSER_EMAIL", "deploy-admin@ea-csc.test")
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "DeployPass123!")
    monkeypatch.setenv("DJANGO_SUPERUSER_FULL_NAME", "Deploy Admin")

    call_command("create_superadmin")

    user = User.objects.get(email="deploy-admin@ea-csc.test")
    assert user.role == User.Role.SUPER_ADMIN
    assert user.full_name == "Deploy Admin"
    assert user.is_active is True
    assert user.is_staff is True
    assert user.is_superuser is True
    assert user.check_password("DeployPass123!")


def test_accepts_cli_arguments():
    call_command(
        "create_superadmin",
        email="cli-admin@ea-csc.test",
        password="CliPass123!",
        full_name="CLI Admin",
    )

    user = User.objects.get(email="cli-admin@ea-csc.test")
    assert user.role == User.Role.SUPER_ADMIN
    assert user.full_name == "CLI Admin"
    assert user.check_password("CliPass123!")


def test_is_idempotent(monkeypatch):
    monkeypatch.setenv("DJANGO_SUPERUSER_EMAIL", "repeat-admin@ea-csc.test")
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "RepeatPass123!")

    call_command("create_superadmin")
    call_command("create_superadmin")

    assert User.objects.filter(email="repeat-admin@ea-csc.test").count() == 1
    user = User.objects.get(email="repeat-admin@ea-csc.test")
    assert user.check_password("RepeatPass123!")


def test_promotes_existing_admin(monkeypatch):
    user = AdminFactory.create(email="promote-admin@ea-csc.test")
    monkeypatch.setenv("DJANGO_SUPERUSER_EMAIL", user.email)
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "PromotePass123!")

    call_command("create_superadmin")

    user.refresh_from_db()
    assert user.role == User.Role.SUPER_ADMIN
    assert user.is_staff is True
    assert user.is_superuser is True
    assert user.check_password(PASSWORD)


def test_reactivates_inactive_superadmin(monkeypatch):
    user = SuperAdminFactory.create(
        email="inactive-admin@ea-csc.test",
        is_active=False,
    )
    monkeypatch.setenv("DJANGO_SUPERUSER_EMAIL", user.email)

    call_command("create_superadmin")

    user.refresh_from_db()
    assert user.is_active is True
    assert user.role == User.Role.SUPER_ADMIN


def test_does_not_reset_password_without_flag(monkeypatch):
    user = SuperAdminFactory.create(email="stable-admin@ea-csc.test")
    monkeypatch.setenv("DJANGO_SUPERUSER_EMAIL", user.email)
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "DifferentPass123!")

    call_command("create_superadmin")

    user.refresh_from_db()
    assert user.check_password(PASSWORD)
    assert not user.check_password("DifferentPass123!")


def test_update_password_flag_resets_password(monkeypatch):
    user = SuperAdminFactory.create(email="rotate-admin@ea-csc.test")
    monkeypatch.setenv("DJANGO_SUPERUSER_EMAIL", user.email)
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "RotatedPass123!")

    call_command("create_superadmin", update_password=True)

    user.refresh_from_db()
    assert user.check_password("RotatedPass123!")


def test_skips_without_credentials_when_superadmin_exists():
    SuperAdminFactory.create()

    call_command("create_superadmin")

    assert User.objects.filter(role=User.Role.SUPER_ADMIN).count() == 1


def test_fails_without_credentials_when_no_superadmin_exists():
    with pytest.raises(CommandError, match="DJANGO_SUPERUSER_EMAIL"):
        call_command("create_superadmin")


def test_fails_when_creating_without_password(monkeypatch):
    monkeypatch.setenv("DJANGO_SUPERUSER_EMAIL", "no-password@ea-csc.test")

    with pytest.raises(CommandError, match="DJANGO_SUPERUSER_PASSWORD"):
        call_command("create_superadmin")


def test_rejects_invalid_email(monkeypatch):
    monkeypatch.setenv("DJANGO_SUPERUSER_EMAIL", "not-an-email")
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "ValidPass123!")

    with pytest.raises(CommandError, match="Invalid email address"):
        call_command("create_superadmin")


def test_rejects_weak_password(monkeypatch):
    monkeypatch.setenv("DJANGO_SUPERUSER_EMAIL", "weak-password@ea-csc.test")
    monkeypatch.setenv("DJANGO_SUPERUSER_PASSWORD", "123")

    with pytest.raises(CommandError, match="Invalid super admin password"):
        call_command("create_superadmin")
