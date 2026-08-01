from django.contrib import admin

from .models import RoomLocation


@admin.register(RoomLocation)
class RoomLocationAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "building", "category", "floor", "is_active"]
    list_filter = ["category", "building", "is_active"]
    search_fields = ["name", "code", "description", "building__name"]
