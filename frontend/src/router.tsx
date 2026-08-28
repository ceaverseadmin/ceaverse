import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { Spinner } from './components/Feedback'
import PublicLayout from './components/PublicLayout'
import RequireAdmin from './auth/RequireAdmin'
import AdminLayout from './admin/AdminLayout'
import LoginPage from './admin/LoginPage'
import SignupPage from './admin/SignupPage'
import DashboardPage from './admin/DashboardPage'
import AdminManagementPage from './admin/AdminManagementPage'
import PendingApprovalPage from './admin/PendingApprovalPage'
import ProfilePage from './admin/ProfilePage'
import ActivityLogsPage from './admin/ActivityLogsPage'
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
    { path: '/library', element: withSuspense(<EbooksPage />) },
    { path: '/library/:id', element: withSuspense(<EbookDetailPage />) },
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
    { path: 'signup', element: <SignupPage /> },
    { path: 'pending-approval', element: <PendingApprovalPage /> },
    {
      element: <RequireAdmin />,
      children: [
        {
          element: <AdminLayout />,
          children: [
            { path: 'dashboard', element: <DashboardPage /> },
            { path: 'library', element: withSuspense(<EbooksAdminPage />) },
            { path: 'lost-found', element: withSuspense(<LostFoundAdminPage />) },
            { path: 'voice', element: withSuspense(<VoiceAdminPage />) },
            { path: 'content', element: withSuspense(<ContentPage />) },
            { path: 'floor-plans', element: withSuspense(<FloorPlansAdminPage />) },
            { path: 'wayfinding', element: withSuspense(<WayfindingAdminPage />) },
            { path: 'admin', element: <AdminManagementPage /> },
            { path: 'users', element: withSuspense(<UsersPage />) },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'activity-logs', element: <ActivityLogsPage /> },
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
