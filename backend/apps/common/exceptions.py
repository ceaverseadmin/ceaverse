"""Global DRF exception handler producing the standard envelope."""
from rest_framework.response import Response
from rest_framework.views import exception_handler


def _extract_message(data):
    """Derive a single human-readable message from DRF error data."""
    if data is None:
        return "Request failed."
    if isinstance(data, str):
        return data
    if isinstance(data, dict):
        if "detail" in data:
            detail = data["detail"]
            return detail if isinstance(detail, str) else "Request failed."
        for value in data.values():
            if isinstance(value, list) and value and isinstance(value[0], str):
                return value[0]
            if isinstance(value, str):
                return value
        return "Request failed."
    if isinstance(data, list) and data and isinstance(data[0], str):
        return data[0]
    return "Request failed."


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        # Unexpected error — never leak internals to clients.
        return Response(
            {
                "success": False,
                "message": "An unexpected server error occurred.",
                "data": None,
                "errors": None,
            },
            status=500,
        )

    data = response.data
    return Response(
        {
            "success": False,
            "message": _extract_message(data),
            "data": None,
            "errors": data,
        },
        status=response.status_code,
    )
