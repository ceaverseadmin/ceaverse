from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import VoiceSubmissionViewSet, VoiceWallView

router = DefaultRouter()
router.register("admin/submissions", VoiceSubmissionViewSet, basename="voice-submissions")

urlpatterns = [
    path("", VoiceWallView.as_view(), name="voice-wall"),
]
urlpatterns += router.urls
