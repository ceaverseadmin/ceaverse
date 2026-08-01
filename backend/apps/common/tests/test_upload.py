"""Tests for upload name generation."""
import re
from uuid import UUID

from common.upload import unique_upload_name


def test_preserves_extension():
    name = unique_upload_name("ebook.pdf")
    assert name.endswith(".pdf")
    UUID(name[:-4])  # basename is a hex UUID, no path separators


def test_strips_path_and_traversal():
    name = unique_upload_name("../../etc/passwd.pdf")
    assert name.endswith(".pdf")
    assert "/" not in name
    UUID(name[:-4])


def test_lowercases_extension():
    name = unique_upload_name("Cover.PNG")
    assert name.endswith(".png")


def test_names_are_unique():
    first = unique_upload_name("a.pdf")
    second = unique_upload_name("a.pdf")
    assert first != second


def test_prefix_creates_folder():
    name = unique_upload_name("a.pdf", "ebooks/files")
    assert name.startswith("ebooks/files/")
    assert re.fullmatch(r"ebooks/files/[0-9a-f]{32}\.pdf", name)


def test_empty_prefix_no_slash():
    name = unique_upload_name("a.pdf", "")
    assert name.startswith("/") is False
    assert "/" not in name
