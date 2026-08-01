"""Landing page models.

Single-instance sections (Hero, About, Mission, Vision, Contact) are always
stored with ``pk=1``; multi-item lists (ServiceCard, DownloadableLink) are
ordinary rows ordered by ``order``.
"""
from common.upload import unique_upload_name
from common.validators import validate_image, validate_pdf
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.deconstruct import deconstructible


@deconstructible
class UploadToPath:
    """Serializable ``upload_to`` callable producing unique file names."""

    def __init__(self, folder):
        self.folder = folder

    def __call__(self, instance, filename):
        return unique_upload_name(filename, self.folder)


class SingletonModel(models.Model):
    """Abstract base for single-row models (always stored with pk=1)."""

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _created = cls.objects.get_or_create(pk=1)
        return obj


class Hero(SingletonModel):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    background_image = models.ImageField(
        upload_to=UploadToPath("landing/hero"),
        blank=True,
        null=True,
        validators=[validate_image],
    )
    cta_label = models.CharField(max_length=50, blank=True)
    cta_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Hero section"


class AboutSection(SingletonModel):
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    image = models.ImageField(
        upload_to=UploadToPath("landing/about"),
        blank=True,
        null=True,
        validators=[validate_image],
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "About section"


class MissionSection(SingletonModel):
    content = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Mission section"


class VisionSection(SingletonModel):
    content = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Vision section"


class ContactSection(SingletonModel):
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.CharField(max_length=300, blank=True)
    map_link = models.URLField(blank=True)
    working_hours = models.CharField(max_length=200, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Contact section"


class ServiceCard(models.Model):
    icon = models.CharField(max_length=64, blank=True)
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "created_at"]

    def __str__(self):
        return self.title


class DownloadableLink(models.Model):
    label = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    file = models.FileField(
        upload_to=UploadToPath("landing/downloads"),
        blank=True,
        null=True,
        validators=[validate_pdf],
    )
    external_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "created_at"]

    def clean(self):
        if not self.file and not self.external_url:
            raise ValidationError(
                "A link needs either a file or an external URL."
            )

    def __str__(self):
        return self.label
