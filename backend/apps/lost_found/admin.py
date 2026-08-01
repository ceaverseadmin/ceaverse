from django.contrib import admin

from .models import LostFoundItem


@admin.register(LostFoundItem)
class LostFoundItemAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "item_type",
        "category",
        "status",
        "is_public",
        "tracking_code",
        "created_at",
    ]
    list_filter = ["item_type", "category", "status", "is_public"]
    search_fields = ["title", "description", "tracking_code", "contact_email", "contact_name"]
    readonly_fields = ["tracking_code", "created_at", "updated_at"]
