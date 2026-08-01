from django.contrib import admin

from .models import (
    AboutSection,
    ContactSection,
    DownloadableLink,
    Hero,
    MissionSection,
    ServiceCard,
    VisionSection,
)


@admin.register(Hero)
class HeroAdmin(admin.ModelAdmin):
    list_display = ["title", "subtitle", "is_active", "updated_at"]


@admin.register(AboutSection)
class AboutSectionAdmin(admin.ModelAdmin):
    list_display = ["title", "updated_at"]


@admin.register(MissionSection)
class MissionSectionAdmin(admin.ModelAdmin):
    list_display = ["id", "updated_at"]


@admin.register(VisionSection)
class VisionSectionAdmin(admin.ModelAdmin):
    list_display = ["id", "updated_at"]


@admin.register(ContactSection)
class ContactSectionAdmin(admin.ModelAdmin):
    list_display = ["email", "phone", "updated_at"]


@admin.register(ServiceCard)
class ServiceCardAdmin(admin.ModelAdmin):
    list_display = ["title", "order", "is_active", "updated_at"]
    list_filter = ["is_active"]
    search_fields = ["title", "description"]


@admin.register(DownloadableLink)
class DownloadableLinkAdmin(admin.ModelAdmin):
    list_display = ["label", "order", "is_active", "updated_at"]
    list_filter = ["is_active"]
    search_fields = ["label", "description"]
