"""DRF renderer that wraps every response in a consistent envelope.

Shape: ``{"success": bool, "message": str|None, "data": ...|None, "errors": ...|None}``
"""
from rest_framework.renderers import JSONRenderer


class ApiRenderer(JSONRenderer):
    """Render all responses with a uniform success envelope."""

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = (renderer_context or {}).get("response")
        status_code = response.status_code if response else 200

        # Already an envelope (e.g. hand-built error responses) — pass through.
        if isinstance(data, dict) and "success" in data:
            return super().render(data, accepted_media_type, renderer_context)

        payload = {
            "success": 200 <= status_code < 300,
            "message": None,
            "data": data,
            "errors": None,
        }
        return super().render(payload, accepted_media_type, renderer_context)
