import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from './components/Feedback'
import PublicLayout from './components/PublicLayout'
import RequireAdmin from './auth/RequireAdmin'
import AdminLayout from './admin/AdminLayout'
import LoginPage from './admin/LoginPage'
import DashboardPage from './admin/DashboardPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import {
  ContentPage,
  EbookDetailPage,
  EbooksAdminPage,
  EbooksPage,
  FloorPlansAdminPage,
  FloorPlansPage,
  LostFoundAdminPage,
  LostFoundPage,
  LostFoundSubmitPage,
  LostFoundTrackPage,
  UsersPage,
  VoiceAdminPage,
  VoicePage,
  WayfindingAdminPage,
  WayfindingPage,
} from './lazyRoutes'

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

const adminRoutes: RouteObject = {
  path: '/admin',
  children: [
    { index: true, element: <Navigate to="/admin/dashboard" replace /> },
    { path: 'login', element: <LoginPage /> },
    {
      element: <RequireAdmin />,
      children: [
        {
          element: <AdminLayout />,
          children: [
            { path: 'dashboard', element: <DashboardPage /> },
            { path: 'ebooks', element: withSuspense(<EbooksAdminPage />) },
            { path: 'lost-found', element: withSuspense(<LostFoundAdminPage />) },
            { path: 'voice', element: withSuspense(<VoiceAdminPage />) },
            { path: 'content', element: withSuspense(<ContentPage />) },
            { path: 'floor-plans', element: withSuspense(<FloorPlansAdminPage />) },
            { path: 'wayfinding', element: withSuspense(<WayfindingAdminPage />) },
            { path: 'users', element: withSuspense(<UsersPage />) },
          ],
        },
      ],
    },
  ],
}

export const router = createBrowserRouter([
  publicRoutes,
  adminRoutes,
  { path: '*', element: <NotFoundPage /> },
])
