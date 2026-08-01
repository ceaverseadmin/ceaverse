from django.contrib import admin

from .models import VoiceSubmission


@admin.register(VoiceSubmission)
class VoiceSubmissionAdmin(admin.ModelAdmin):
    list_display = ["category", "display_name", "status", "created_at"]
    list_filter = ["category", "status"]
    search_fields = ["content", "name"]
    readonly_fields = ["created_at", "updated_at"]
