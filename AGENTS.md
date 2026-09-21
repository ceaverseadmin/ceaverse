# CEAVERSE — Agent Guide

> **MANDATORY:** Always consult this file before implementing any code. These
> conventions and gotchas override default assumptions.

Engineering & Architecture Student Council web portal. Django REST API + React SPA.

## Stack

| Layer     | Technology                                                             |
| --------- | ---------------------------------------------------------------------- |
| Frontend  | React 19 + TypeScript, Vite 8, Tailwind CSS 4, React Router 7, TanStack Query, Axios |
| Backend   | Django 5 + Django REST Framework, SimpleJWT, django-filter             |
| Database  | SQLite (dev) · Neon PostgreSQL (prod)                                  |
| Storage   | Local filesystem (dev) · Cloudinary (prod)                            |

## Repository layout

```
frontend/   React SPA (Vite)
backend/    Django + DRF
docs/       currently empty
```

### Backend apps (`backend/apps/`)

`accounts` (auth, users, audit), `common` (renderers, exceptions, pagination,
storage, upload, validators), `landing`, `ebooks`, `lost_found`, `student_voice`,
`wayfinding`, `floorplans`, `dashboard`.

## Commands

Run backend commands from `backend/` with the venv interpreter:

```powershell
.venv\Scripts\python.exe manage.py migrate
.venv\Scripts\python.exe manage.py seed            # --force to reset seeded content
.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
.venv\Scripts\python.exe -m ruff check .
.venv\Scripts\python.exe -m pytest
```

Run frontend commands from `frontend/`:

```powershell
npm run dev -- --host 127.0.0.1
npm run typecheck
npm run lint
npm run format:check
npm run build
```

## Conventions

- **API envelope**: every response is `{ success, message, data, errors }`,
  produced by `common.renderers.ApiRenderer` and
  `common.exceptions.api_exception_handler`. Wrap hand-built responses in the
  same shape.
- **Settings split**: `config.settings.base` plus `development` / `production` /
  `test`. `manage.py` defaults to `development`; pytest uses
  `config.settings.test`. Never import environment-specific settings directly in
  app code.
- **Auth**: email is the login identifier (`USERNAME_FIELD = "email"`). Roles:
  `super_admin`, `admin`, `officer`. SimpleJWT access (30 min) + refresh (7 days)
  with rotation and blacklist.
- **Permissions**: `accounts.permissions` — `IsAdminOrHigher`,
  `IsAdminOrReadOnly`, `IsStaffOrReadOnly`, `IsSuperAdmin`. The global DRF
  default is `IsAuthenticated`, so public views must opt in with `AllowAny`.
- **Frontend API access**: import `api` from `lib/api.ts`. Request helpers live
  in `lib/services.ts` (public) and `lib/adminServices.ts` (admin). Unwrap
  envelopes with `unwrap`.
- **Types**: keep shared API types in `lib/types.ts`.
- **Styling**: Tailwind utility classes with the custom `brand-*` palette.

## Gotchas

- The Vite dev server proxies `/api` to `http://127.0.0.1:8000`; the Django
  backend **must** be running, otherwise every API call fails with
  `ECONNREFUSED`.
- DRF authenticates **before** checking permissions. A stale or invalid bearer
  token returns 401 even on `AllowAny` endpoints, so `lib/api.ts` must never
  attach a token to public routes (login, signup, refresh, landing content,
  voice, lost-found public endpoints, and safe reads of ebooks/floorplans/
  wayfinding), and must never swallow its `/admin` sub-routes.
- Work on the `dev` branch.
- Tests need no external credentials; `config.settings.test` forces in-memory
  SQLite, fast hashers, and local storage.

## Before finishing any change

Run the relevant checks and make sure they pass:

- Backend: `.venv\Scripts\python.exe -m ruff check .` and
  `.venv\Scripts\python.exe -m pytest`
- Frontend: `npm run typecheck` and `npm run lint`
