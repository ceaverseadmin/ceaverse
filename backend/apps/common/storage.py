"""Custom Cloudinary storage backends.

``MediaCloudinaryStorage`` from django-cloudinary-storage uploads everything
as an ``image`` resource. Our portal stores both images (ebook covers, lost &
found photos) and raw documents (ebook PDFs, floor-plan PDFs), so we route by
file extension instead.
"""
import os

from cloudinary_storage.storage import (
    RESOURCE_TYPES,
    MediaCloudinaryStorage,
)

# Extensions Cloudinary treats as images. Anything else (PDFs, etc.) is raw.
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}


def get_extension(name: str) -> str | None:
    """Return the lowercase extension of ``name`` or ``None``."""
    _, extension = os.path.splitext(name)
    return extension.lower() or None


class MediaAutoCloudinaryStorage(MediaCloudinaryStorage):
    """Cloudinary storage that picks image/raw resource types per file.

    Images are uploaded as ``image`` resources so Cloudinary can optimise and
    transform them; everything else (ebook PDFs, floor-plan PDFs) is uploaded
    as ``raw`` so it is served byte-for-byte for in-browser preview/download.
    """

    RESOURCE_TYPE = RESOURCE_TYPES["RAW"]

    def _get_resource_type(self, name: str) -> str:
        extension = get_extension(name)
        if extension in IMAGE_EXTENSIONS:
            return RESOURCE_TYPES["IMAGE"]
        return RESOURCE_TYPES["RAW"]
