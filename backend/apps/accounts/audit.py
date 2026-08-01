"""Activity logging helpers."""
from .models import ActivityLog


def log_action(user, action, model_name="", object_id=None, details=None, request=None):
    """Persist an audit record. `user` may be an AnonymousUser."""
    return ActivityLog.objects.create(
        user=user if getattr(user, "is_authenticated", False) else None,
        action=action,
        model_name=model_name,
        object_id=str(object_id) if object_id is not None else "",
        details=details or {},
        ip_address=_client_ip(request) if request is not None else None,
    )


def _client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
