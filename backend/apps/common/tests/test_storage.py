"""Tests for Cloudinary storage resource-type routing."""
from common.storage import MediaAutoCloudinaryStorage

storage = MediaAutoCloudinaryStorage()


def test_image_extension_maps_to_image():
    for name in ("ebooks/covers/abc.png", "lost/cat.JPG", "x.webp"):
        assert storage._get_resource_type(name) == "image"


def test_pdf_maps_to_raw():
    assert storage._get_resource_type("ebooks/files/abc.pdf") == "raw"
    assert storage._get_resource_type("floorplans/floor1.PDF") == "raw"


def test_unknown_extension_maps_to_raw():
    assert storage._get_resource_type("files/archive.zip") == "raw"
    assert storage._get_resource_type("files/noextension") == "raw"
