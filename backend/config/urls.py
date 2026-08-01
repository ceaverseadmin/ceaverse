"""Root URL configuration."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("accounts.urls")),
    path("api/landing/", include("landing.urls")),
    path("api/ebooks/", include("ebooks.urls")),
    path("api/lost-found/", include("lost_found.urls")),
    path("api/voice/", include("student_voice.urls")),
    path("api/floorplans/", include("floorplans.urls")),
    path("api/wayfinding/", include("wayfinding.urls")),
    path("api/dashboard/", include("dashboard.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
