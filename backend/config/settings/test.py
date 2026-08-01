"""Test settings — in-memory SQLite, fast hashers, local file storage.

Tests run without any external credentials (Neon, Cloudinary).
"""
from .base import *  # noqa: F403

DEBUG = False
SECRET_KEY = "test-secret-key-that-is-longer-than-thirty-two-bytes"

# Django test client uses the ``testserver`` host.
ALLOWED_HOSTS = ["*"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Keep uploaded-file tests off Cloudinary (no external credentials).
STORAGES["default"]["BACKEND"] = "django.core.files.storage.FileSystemStorage"

# Importing ``common.storage`` requires the cloudinary_storage app to be
# configured. Dummy values satisfy that (uploads never reach Cloudinary).
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": "test",
    "API_KEY": "test",
    "API_SECRET": "test",
}

# Speed up tests.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
