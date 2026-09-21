---
name: react-admin
description: Use when building or fixing CEAVERSE React frontend features — pages, admin flows, API service functions, TanStack Query, auth, routing, and Tailwind styling.
---

# React frontend conventions (CEAVERSE)

Stack: React 19 + TypeScript, Vite 8, Tailwind CSS 4, React Router 7,
TanStack Query, Axios. Root: `frontend/src/`.

## API layer

- Axios instance: `lib/api.ts` (baseURL `/api`). It attaches the bearer token
  only to protected routes and handles 401 refresh/rotation.
- Public request helpers: `lib/services.ts`. Admin helpers: `lib/adminServices.ts`.
- Always unwrap envelopes with `unwrap`:

```ts
const { data } = await api.get<ApiEnvelope<Paginated<Book>>>('/ebooks/')
return unwrap(data)
```

- Shared API types live in `lib/types.ts`.

## Data fetching

Use TanStack Query for server state:

```ts
const { data, isLoading, isError } = useQuery({
  queryKey: ['landing'],
  queryFn: fetchLandingContent,
})
```

Handle loading with `Spinner` and errors with `ErrorState` from
`components/Feedback`.

## Routing and auth

- Routes are declared in `src/router.tsx`; lazy pages are exported from
  `src/lazyRoutes.tsx`.
- Public pages: `src/pages/*`, wrapped by `PublicLayout`.
- Admin pages: `src/admin/*`, guarded by `RequireAdmin` and wrapped by
  `AdminLayout`.
- Auth state comes from `useAuth()` (`user`, `loading`, `isAdmin`,
  `isSuperAdmin`, `login`, `logout`).

## Styling

Tailwind utility classes with the custom `brand-*` palette (e.g.
`bg-brand-600`, `text-brand-300`). Match the patterns of neighboring components;
do not add new CSS files.

## Verify

```powershell
npm run typecheck
npm run lint
```
