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
        "created_at",
    ]
    list_filter = ["item_type", "category", "status", "is_public"]
    search_fields = ["title", "description", "contact_email", "contact_name"]
    readonly_fields = ["created_at", "updated_at"]
