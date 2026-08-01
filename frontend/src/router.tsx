import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from './components/Feedback'
import PublicLayout from './components/PublicLayout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

const EbooksPage = lazy(() => import('./pages/EbooksPage'))
const EbookDetailPage = lazy(() => import('./pages/EbookDetailPage'))
const LostFoundPage = lazy(() => import('./pages/LostFoundPage'))
const LostFoundSubmitPage = lazy(() => import('./pages/LostFoundSubmitPage'))
const LostFoundTrackPage = lazy(() => import('./pages/LostFoundTrackPage'))
const VoicePage = lazy(() => import('./pages/VoicePage'))
const FloorPlansPage = lazy(() => import('./pages/FloorPlansPage'))
const WayfindingPage = lazy(() => import('./pages/WayfindingPage'))

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<Spinner />}>{node}</Suspense>
}

const publicRoutes: RouteObject = {
  element: <PublicLayout />,
  children: [
    { path: '/', element: <HomePage /> },
    { path: '/ebooks', element: withSuspense(<EbooksPage />) },
    { path: '/ebooks/:id', element: withSuspense(<EbookDetailPage />) },
    { path: '/lost-found', element: withSuspense(<LostFoundPage />) },
    { path: '/lost-found/submit', element: withSuspense(<LostFoundSubmitPage />) },
    { path: '/lost-found/track', element: withSuspense(<LostFoundTrackPage />) },
    { path: '/voice', element: withSuspense(<VoicePage />) },
    { path: '/floor-plans', element: withSuspense(<FloorPlansPage />) },
    { path: '/wayfinding', element: withSuspense(<WayfindingPage />) },
  ],
}

// Admin routes are added in a later phase.
const adminRoutes: RouteObject = {
  path: '/admin',
  element: <Navigate to="/" replace />,
}

export const router = createBrowserRouter([
  publicRoutes,
  adminRoutes,
  { path: '*', element: <NotFoundPage /> },
])
