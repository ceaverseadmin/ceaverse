---
name: drf-api
description: Use when adding or changing Django REST Framework endpoints in CEAVERSE — serializers, views, viewsets, permissions, routers, URL wiring, and response envelopes.
---

# DRF API conventions (CEAVERSE)

## Anatomy of an app

Each app under `backend/apps/<app>/` follows:

```
models.py        # domain models
serializers.py   # DRF serializers
views.py         # APIView / ViewSet
urls.py          # router + path() definitions
admin.py
tests/           # pytest tests + fixtures
migrations/
```

## Response envelope

Every response is wrapped by `common.renderers.ApiRenderer`:

```json
{ "success": true, "message": null, "data": {}, "errors": null }
```

Errors flow through `common.exceptions.api_exception_handler`, which builds the
same shape. For hand-written responses inside a view, return the envelope
yourself:

```python
return Response(
    {"success": True, "message": None, "data": serializer.data, "errors": None}
)
```

## Permissions

The global default (in `config/settings/base.py`) is `IsAuthenticated`. Import
role checks from `accounts.permissions`:

- `IsSuperAdmin` — super admins only.
- `IsAdminOrHigher` — super admins + administrators (use for admin viewsets).
- `IsAdminOrReadOnly` — anyone may read; only administrators may write.
- `IsStaffOrReadOnly` — any authenticated user may read; administrators may write.

Public (unauthenticated) views must set `permission_classes = (AllowAny,)`.

## Views and routers

- CRUD resources: `viewsets.ModelViewSet` registered on a `DefaultRouter` in
  `urls.py`.
- One-off actions: `APIView` (or `RetrieveUpdateAPIView` for singletons) mapped
  with `path()`.
- Mount each app in `config/urls.py` under
  `path("api/<app>/", include("<app>.urls"))`.

## Pagination, filtering, ordering

The DRF defaults provide `common.pagination.StandardResultsSetPagination`
(`PAGE_SIZE = 20`), `DjangoFilterBackend`, `SearchFilter`, and `OrderingFilter`.
Declare `filterset_fields`, `search_fields`, `ordering_fields`, and `ordering`
on viewsets instead of hand-rolling query logic.

## Checklist for a new endpoint

1. Model (if needed) + migration (`manage.py makemigrations`).
2. Serializer in `serializers.py`.
3. View/ViewSet with the right `permission_classes`.
4. Route in the app `urls.py`; app included in `config/urls.py`.
5. Admin registration if it should appear in Django admin.
6. pytest coverage using `accounts/tests/factories.py`.
7. `.venv\Scripts\python.exe -m ruff check .` and
   `.venv\Scripts\python.exe -m pytest`.
