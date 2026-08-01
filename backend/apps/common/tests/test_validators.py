"""Tests for common file upload validators."""
import pytest
from common.validators import (
    IMAGE_MAX_SIZE_MB,
    PDF_MAX_SIZE_MB,
    validate_image,
    validate_pdf,
)
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile

# Minimal 1x1 PNG (valid magic bytes).
PNG_1PX = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d49444154789c626001000000ffff03000006000557"
    "bfabd40000000049454e44ae426082"
)

PDF_MINIMAL = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF\n"


def _upload(name, content, content_type):
    return SimpleUploadedFile(name, content, content_type=content_type)


def _oversized(upload, size):
    upload.size = size  # instance attr shadows ``File.size`` property
    return upload


class TestValidateImage:
    def test_accepts_png(self):
        validate_image(_upload("cover.png", PNG_1PX, "image/png"))

    def test_accepts_jpeg(self):
        # filetype identifies JPEG by its SOI marker.
        jpeg = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01"
        validate_image(_upload("cover.jpg", jpeg, "image/jpeg"))

    def test_rejects_disguised_script(self):
        upload = _upload("cover.png", b"#!/bin/sh\necho pwned", "image/png")
        with pytest.raises(ValidationError):
            validate_image(upload)

    def test_rejects_pdf(self):
        upload = _upload("cover.pdf", PDF_MINIMAL, "application/pdf")
        with pytest.raises(ValidationError):
            validate_image(upload)

    def test_rejects_oversized(self):
        upload = _oversized(
            _upload("big.png", PNG_1PX, "image/png"),
            IMAGE_MAX_SIZE_MB * 1024 * 1024 + 1,
        )
        with pytest.raises(ValidationError, match="5 MB or smaller"):
            validate_image(upload)

    def test_does_not_consume_file(self):
        upload = _upload("cover.png", PNG_1PX, "image/png")
        validate_image(upload)
        assert upload.read() == PNG_1PX


class TestValidatePdf:
    def test_accepts_pdf(self):
        validate_pdf(_upload("ebook.pdf", PDF_MINIMAL, "application/pdf"))

    def test_rejects_image(self):
        upload = _upload("ebook.png", PNG_1PX, "image/png")
        with pytest.raises(ValidationError):
            validate_pdf(upload)

    def test_rejects_oversized(self):
        upload = _oversized(
            _upload("big.pdf", PDF_MINIMAL, "application/pdf"),
            PDF_MAX_SIZE_MB * 1024 * 1024 + 1,
        )
        with pytest.raises(ValidationError, match="20 MB or smaller"):
            validate_pdf(upload)
