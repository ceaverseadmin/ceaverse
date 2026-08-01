from django.contrib import admin

from .models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ["title", "author", "category", "is_active", "order", "updated_at"]
    list_filter = ["category", "is_active"]
    search_fields = ["title", "author", "description"]
    readonly_fields = ["created_at", "updated_at"]
