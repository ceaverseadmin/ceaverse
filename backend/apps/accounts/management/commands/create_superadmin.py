"""Create or update the deployment super admin idempotently."""

import os

from accounts.models import User
from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.core.validators import validate_email


class Command(BaseCommand):
    help = (
        "Create or update the super admin from DJANGO_SUPERUSER_* environment "
        "variables. Safe to run on every deployment."
    )

    def add_arguments(self, parser):
        
        parser.add_argument(
            "--email",
            default=None,
            help="Super admin email. Defaults to DJANGO_SUPERUSER_EMAIL.",
        )
        parser.add_argument(
            "--password",
            default=None,
            help="Super admin password. Defaults to DJANGO_SUPERUSER_PASSWORD.",
        )
        parser.add_argument(
            "--full-name",
            default=None,
            help=(
                "Super admin display name. Defaults to "
                "DJANGO_SUPERUSER_FULL_NAME."
            ),
        )
        parser.add_argument(
            "--update-password",
            action="store_true",
            help="Reset the password for an existing super admin.",
        )

    def handle(self, *args, **options):
        email = self._value(options["email"], "DJANGO_SUPERUSER_EMAIL").lower()
        password = self._value(
            options["password"], "DJANGO_SUPERUSER_PASSWORD", strip=False
        )
        full_name = self._value(
            options["full_name"], "DJANGO_SUPERUSER_FULL_NAME"
        )

        if not email:
            if User.objects.filter(role=User.Role.SUPER_ADMIN).exists():
                self.stdout.write("Super admin already exists; nothing to do.")
                return
            raise CommandError(
                "DJANGO_SUPERUSER_EMAIL is required when no super admin exists."
            )

        try:
            validate_email(email)
        except ValidationError as exc:
            raise CommandError(f"Invalid email address: {email}") from exc

        if len(full_name) > 150:
            raise CommandError("DJANGO_SUPERUSER_FULL_NAME must be 150 characters or fewer.")

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            if not password:
                raise CommandError(
                    "DJANGO_SUPERUSER_PASSWORD is required to create a super admin."
                )
            self._validate_password(password, User(email=email, full_name=full_name))
            user = User.objects.create_superuser(
                email=email,
                password=password,
                full_name=full_name,
            )
            self.stdout.write(self.style.SUCCESS(f"Created super admin {user.email}."))
            return

        changed = self._sync_existing_user(user, email, full_name)

        if options["update_password"]:
            if not password:
                raise CommandError(
                    "DJANGO_SUPERUSER_PASSWORD is required with --update-password."
                )
            self._validate_password(password, user)
            user.set_password(password)
            changed = True

        if changed:
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Updated super admin {user.email}."))
            return

        self.stdout.write(f"Super admin {user.email} is already up to date.")

    @staticmethod
    def _value(cli_value, env_name, *, strip=True):
        value = cli_value if cli_value is not None else os.environ.get(env_name, "")
        if not value:
            return ""
        return value.strip() if strip else value

    @staticmethod
    def _validate_password(password, user):
        try:
            password_validation.validate_password(password, user=user)
        except ValidationError as exc:
            messages = " ".join(exc.messages)
            raise CommandError(f"Invalid super admin password: {messages}") from exc

    @staticmethod
    def _sync_existing_user(user, email, full_name):
        changed = False

        if user.email != email:
            user.email = email
            changed = True
        if user.role != User.Role.SUPER_ADMIN:
            user.role = User.Role.SUPER_ADMIN
            changed = True
        if not user.is_active:
            user.is_active = True
            changed = True
        if not user.is_staff:
            user.is_staff = True
            changed = True
        if not user.is_superuser:
            user.is_superuser = True
            changed = True
        if full_name and user.full_name != full_name:
            user.full_name = full_name
            changed = True

        return changed
