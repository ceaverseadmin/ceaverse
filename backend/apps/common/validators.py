"""File upload validators using magic-byte sniffing (``filetype``).

Always validate file *content*, not just the name, to block disguised
executables or spoofed extensions.
"""
import filetype
from django.core.exceptions import ValidationError

IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
PDF_EXTENSIONS = {"pdf"}

IMAGE_MAX_SIZE_MB = 5
PDF_MAX_SIZE_MB = 20


def _validate(file, allowed_extensions, max_size_mb, label):
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"{label} must be {max_size_mb} MB or smaller.")

    kind = filetype.guess(file)
    if kind is None or kind.extension not in allowed_extensions:
        raise ValidationError(
            f"{label} must be one of the following types: "
            f"{', '.join(sorted(allowed_extensions))}."
        )
    return file


def validate_image(file):
    return _validate(file, IMAGE_EXTENSIONS, IMAGE_MAX_SIZE_MB, "Image")


def validate_pdf(file):
    return _validate(file, PDF_EXTENSIONS, PDF_MAX_SIZE_MB, "PDF file")
