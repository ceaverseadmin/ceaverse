"""HTTP caching for public, anonymous API reads.

Only a small allowlist of public GET endpoints receives browser/CDN cache
headers. Authenticated traffic is never cached because the public read viewsets
hide inactive records for anonymous users but expose them to administrators on
the same URLs.
"""
from django.utils.cache import patch_vary_headers

PUBLIC_CACHE_PREFIXES = (
    "/api/landing/content/",
    "/api/ebooks/",
    "/api/floorplans/buildings/",
    "/api/floorplans/floor-plans/",
    "/api/wayfinding/locations/",
    "/api/lost-found/items/",
    "/api/voice/",
)

PUBLIC_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300"
SAFE_METHODS = frozenset({"GET", "HEAD"})


class PublicApiCacheMiddleware:
    """Add a short public cache policy to allowlisted anonymous API reads."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if self._should_cache(request, response):
            response["Cache-Control"] = PUBLIC_CACHE_CONTROL

            # Keep authenticated responses in a separate cache entry. Without
            # this, a browser cache could serve the anonymous payload to an
            # administrator who sees additional inactive records.
            patch_vary_headers(response, ("Authorization",))

        return response

    def _should_cache(self, request, response):
        if request.method not in SAFE_METHODS:
            return False
        if response.status_code != 200:
            return False
        if request.headers.get("Authorization"):
            return False
        if "/admin/" in request.path:
            return False
        if response.streaming:
            return False
        if not any(
            request.path.startswith(prefix) for prefix in PUBLIC_CACHE_PREFIXES
        ):
            return False

        existing = response.get("Cache-Control", "").lower()
        return "no-store" not in existing and "private" not in existing
