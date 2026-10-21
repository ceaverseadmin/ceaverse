"""Root URL configuration."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path
from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    # Password reset (Django built-in HTML views - not API endpoints)
    path(
        "auth/password-reset/",
        auth_views.PasswordResetView.as_view(
            template_name="registration/password_reset_form.html",
            email_template_name="registration/password_reset_email.html",
            subject_template_name="registration/password_reset_subject.txt",
            success_url="/auth/password-reset/done/",
        ),
        name="password_reset",
    ),
    path(
        "auth/password-reset/done/",
        auth_views.PasswordResetDoneView.as_view(
            template_name="registration/password_reset_done.html"
        ),
        name="password_reset_done",
    ),
    path(
        "auth/reset/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="registration/password_reset_confirm.html",
            success_url="/auth/reset/done/",
        ),
        name="password_reset_confirm",
    ),
    path(
        "auth/reset/done/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="registration/password_reset_complete.html"
        ),
        name="password_reset_complete",
    ),
    # API endpoints
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
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
        view=xframe_options_sameorigin(serve),
    )
