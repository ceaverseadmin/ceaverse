# EA-CSC Web Portal

Centralized digital platform for Engineering & Architecture students — academic
resources, student services, campus navigation, and organization information.

## Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Frontend  | React + TypeScript, Tailwind CSS, React Router, Axios, TanStack Query |
| Backend   | Django + Django REST Framework               |
| Database  | Local SQLite (dev) · Neon PostgreSQL (prod)  |
| Storage   | Cloudinary (images + PDFs)                    |
| Hosting   | Frontend: Vercel · Backend: Render            |

## Repository layout

```
frontend/   React SPA (Vercel)
backend/    Django + DRF (Render)
docs/       architecture, API, database, deployment
assets/     branding and design assets
```

## Quick start (backend)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install -r requirements/development.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Local development uses SQLite with zero configuration. To use Neon/Postgres,
copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.

## Documentation

See `docs/` for architecture, API reference, database schema, environment
variables, and deployment guides.
