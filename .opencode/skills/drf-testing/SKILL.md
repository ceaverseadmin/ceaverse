---
name: drf-testing
description: Use when writing or running backend tests in CEAVERSE — pytest, pytest-django fixtures, factory-boy factories, conftest setup, and test commands.
---

# Backend testing (CEAVERSE)

## Configuration

- `backend/pytest.ini` sets `DJANGO_SETTINGS_MODULE = config.settings.test`.
- `config/settings/test.py` uses in-memory SQLite, MD5 hashers, local file
  storage, and an in-memory email backend — no external credentials needed.
- `apps/conftest.py` provides autouse fixtures: `_db_enabled` (DB access for
  every test) and `_clear_cache` (resets throttle counters between tests).

## Layout

Tests live in each app under `apps/<app>/tests/`:

```
apps/<app>/tests/__init__.py
apps/<app>/tests/test_<feature>.py
apps/accounts/tests/factories.py
```

## Factories

Use the shared factories instead of creating users by hand:

```python
from accounts.tests.factories import (
    UserFactory,
    AdminFactory,
    SuperAdminFactory,
)

PASSWORD = "TestPass123!"
```

Authenticate API requests via SimpleJWT (obtain a token or
`force_authenticate`).

## Running

From `backend/` with the venv interpreter:

```powershell
.venv\Scripts\python.exe -m pytest                       # full suite
.venv\Scripts\python.exe -m pytest apps/ebooks           # one app
.venv\Scripts\python.exe -m pytest -k "some_test_name"   # by name
```

## Conventions

- One behavior per test; assert the envelope shape for API responses
  (`response.json()["success"]`, `["data"]`, `["errors"]`).
- Cover permission boundaries: unauthenticated, officer, admin, super admin.
- Always run `ruff check .` and `pytest` before reporting a backend change done.
