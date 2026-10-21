"""Production settings (Render)."""
import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403

DEBUG = False

if not os.environ.get("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL must be set in production.")

if not SECRET_KEY or SECRET_KEY == "django-insecure-please-change-me":
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be set to a strong, unique value in production."
    )

if len(SECRET_KEY) < 32:
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be at least 32 characters long in production."
    )

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

DATABASES["default"]["CONN_MAX_AGE"] = 0
DATABASES["default"]["CONN_HEALTH_CHECKS"] = True

render_hostname = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if render_hostname:
    if render_hostname not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(render_hostname)
    render_origin = f"https://{render_hostname}"
    if render_origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(render_origin)

# Override frontend URL for production
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://ceaverse-dev.vercel.app")

# django-csp 4.x reads CONTENT_SECURITY_POLICY; the legacy CSP_* settings are
# no longer supported. Exclude the Django admin because it uses inline scripts.
CONTENT_SECURITY_POLICY = {
    "DIRECTIVES": {
        "default-src": ("'self'",),
        "img-src": ("'self'", "data:", "https://res.cloudinary.com"),
        "style-src": ("'self'", "'unsafe-inline'"),
        "script-src": ("'self'",),
        "font-src": ("'self'", "https://fonts.gstatic.com"),
        "connect-src": ("'self'",),
    },
    "EXCLUDE_URL_PREFIXES": ("/admin/",),
}
