# EA-CSC Web Portal

Centralized digital platform for Engineering & Architecture students — academic
resources, student services, campus navigation, and organization information.

## Features

- **Ebooks** — downloadable PDF study materials with in-browser preview
- **Lost & found** — report lost and found items and browse the public list
- **Student voice** — moderated public message wall
- **Navigate** — searchable room/office directory with PDF floor-plan previews
- **Admin dashboard** — manage content and users at `/admin`

## Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Frontend  | React + TypeScript, Tailwind CSS, React Router, Axios, TanStack Query |
| Backend   | Django + Django REST Framework               |
| Database  | Local SQLite (dev) · Neon PostgreSQL (prod)  |
| Storage   | Local filesystem (dev) · Cloudinary (prod)   |
| Hosting   | Frontend: Vercel · Backend: Render           |

## Repository layout

```
frontend/   React SPA (Vercel)
backend/    Django + DRF (Render)
docs/       architecture, API, database, deployment
```

## Quick start

### 1. Backend (Django + DRF)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install -r requirements/development.txt
python manage.py migrate
python manage.py seed             # optional: sample content + demo users
python manage.py runserver 127.0.0.1:8000
```

Local development uses SQLite with zero configuration. To use Neon/Postgres,
copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`. The Vite dev server proxies `/api` to the
backend, so the backend **must** run on `127.0.0.1:8000`.

## Admin login

1. Start the backend and frontend (above).
2. Create an admin account (first time only):

   ```bash
   cd backend
   .venv\Scripts\python.exe manage.py createsuperuser
   ```

   `createsuperuser` prompts for an **email** and password (login is
   email-based, not username-based). You can also create one non-interactively:

   ```bash
   .venv\Scripts\python.exe manage.py shell -c "from accounts.models import User; User.objects.create_superuser(email='admin@example.com', full_name='Admin User', password='YourPass123!')"
   ```

3. Open `http://127.0.0.1:5173/admin/login` and sign in.

> The seeded demo super admin is `admin@ea.edu` / `TestPass123!` (local dev
> SQLite only). Additional demo accounts: `admin2@ea.edu` (admin) and
> `officer@ea.edu` (officer), same password.

## Seed data

Populate the portal with sample content and demo users:

```bash
cd backend
python manage.py seed          # idempotent — never duplicates existing rows
python manage.py seed --force  # wipe content and restore defaults
```

Creates landing sections/service cards, 6 ebooks (with generated placeholder
PDFs), 4 buildings with floor plans, wayfinding locations, and demo accounts.

## Production deployment

### Render backend

Use these Render service settings:

| Setting           | Value                       |
| ----------------- | --------------------------- |
| Root Directory    | `backend`                   |
| Build Command     | `bash build.sh`             |
| Start Command     | `bash start.sh`             |
| Health Check Path | `/api/landing/content/`     |

Set the super admin credentials in the Render dashboard:

```env
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=<strong-password>
DJANGO_SUPERUSER_FULL_NAME=Portal Administrator
```

- `DJANGO_SUPERUSER_PASSWORD` must be a **Secret**.
- `DJANGO_SUPERUSER_EMAIL` and `DJANGO_SUPERUSER_FULL_NAME` can be Config vars.
- `DJANGO_SETTINGS_MODULE` selects production settings for `manage.py` commands.
- Do not add a `VITE_` prefix; these are backend-only values.
- Keep the existing production database, secret key, Cloudinary, CORS, and CSRF
  environment variables configured as well.

`start.sh` runs `create_superadmin` on every deploy. The command is idempotent:
it creates the account when missing, promotes an existing account when needed,
and leaves the existing password unchanged.

To reset the password manually, run this from the Render Shell:

```bash
python manage.py create_superadmin --update-password
```

> Warning: a local `backend/.env` with `DATABASE_URL` pointing to Neon writes to
> the production database. Use Render Shell for production account changes
> unless you intentionally want to run the command locally against Neon.

## Development checks

```bash
# Backend
cd backend
.venv\Scripts\python.exe -m ruff check .
.venv\Scripts\python.exe -m pytest

# Frontend
cd frontend
npm run typecheck
npm run lint
npm run format:check
npm run build
```

## Documentation

See `docs/` for architecture, API reference, database schema, environment
variables, and deployment guides.
