"""Helpers for generating safe, unique upload names."""
import uuid
from pathlib import Path

from django.utils.deconstruct import deconstructible


def unique_upload_name(filename: str, prefix: str = "") -> str:
    """Return a UUID-based storage name preserving the original extension.

    Client-supplied filenames are never trusted: random names avoid
    collisions and directory-traversal via the stored file name.
    """
    extension = Path(filename).suffix.lower()
    name = f"{uuid.uuid4().hex}{extension}"
    if prefix:
        return f"{prefix.strip('/')}/{name}"
    return name


@deconstructible
class UploadToPath:
    """Serializable ``upload_to`` callable producing unique file names."""

    def __init__(self, folder):
        self.folder = folder

    def __call__(self, instance, filename):
        return unique_upload_name(filename, self.folder)
