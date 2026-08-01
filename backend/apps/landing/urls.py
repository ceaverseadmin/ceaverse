from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AboutView,
    ContactView,
    DownloadableLinkViewSet,
    HeroView,
    LandingContentView,
    MissionView,
    ServiceCardViewSet,
    VisionView,
)

router = DefaultRouter()
router.register("service-cards", ServiceCardViewSet, basename="service-cards")
router.register(
    "downloadable-links", DownloadableLinkViewSet, basename="downloadable-links"
)

urlpatterns = [
    path("content/", LandingContentView.as_view(), name="landing-content"),
    path("sections/hero/", HeroView.as_view(), name="landing-hero"),
    path("sections/about/", AboutView.as_view(), name="landing-about"),
    path("sections/mission/", MissionView.as_view(), name="landing-mission"),
    path("sections/vision/", VisionView.as_view(), name="landing-vision"),
    path("sections/contact/", ContactView.as_view(), name="landing-contact"),
]
urlpatterns += router.urls
