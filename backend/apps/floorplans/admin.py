from django.contrib import admin

from .models import Building, FloorPlan


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "order", "is_active", "updated_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "code", "description"]


@admin.register(FloorPlan)
class FloorPlanAdmin(admin.ModelAdmin):
    list_display = ["building", "floor_label", "order", "is_active", "updated_at"]
    list_filter = ["is_active", "building"]
    search_fields = ["floor_label", "building__name"]
