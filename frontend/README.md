# EA-CSC Web Portal — Frontend

React + TypeScript SPA for the EA-CSC Web Portal (Vite, Tailwind CSS v4,
React Router, Axios, TanStack Query).

## Run

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`. The dev server proxies `/api` to the Django
backend, which must run on `127.0.0.1:8000` (see the root `README.md`).

## Scripts

| Command               | Purpose                              |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start the Vite dev server            |
| `npm run build`       | Typecheck + production build         |
| `npm run typecheck`   | TypeScript check (`tsc -b --noEmit`) |
| `npm run lint`        | Oxlint                               |
| `npm run format`      | Prettier write                       |
| `npm run format:check`| Prettier check                       |
| `npm run preview`     | Preview the production build         |

## Layout

```
src/
  pages/       public pages (home, ebooks, lost & found, voice, ...)
  admin/       admin dashboard pages
  components/  shared UI (layout, PDF preview, feedback)
  auth/        auth provider, route guard, auth hooks
  lib/         api client, services, types, formatters
  router.tsx   route definitions
  lazyRoutes.tsx  code-split page imports
```
