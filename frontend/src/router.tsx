import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { RouteSkeleton } from './components/Skeleton'
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
  LostFoundAdminPage,
  LostFoundPage,
  LostFoundSubmitPage,
  NavigateAdminPage,
  NavigatePage,
  UsersPage,
  VoiceAdminPage,
  VoicePage,
} from './lazyRoutes'

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<RouteSkeleton />}>{node}</Suspense>
}

const publicRoutes: RouteObject = {
  element: <PublicLayout />,
  children: [
    { path: '/', element: <HomePage /> },
    { path: '/library', element: withSuspense(<EbooksPage />) },
    { path: '/library/:id', element: withSuspense(<EbookDetailPage />) },
    { path: '/lost-found', element: withSuspense(<LostFoundPage />) },
    { path: '/lost-found/submit', element: withSuspense(<LostFoundSubmitPage />) },
    { path: '/voice', element: withSuspense(<VoicePage />) },
    { path: '/navigate', element: withSuspense(<NavigatePage />) },
    {
      path: '/floor-plans',
      element: <Navigate to="/navigate" replace />,
    },
    {
      path: '/wayfinding',
      element: <Navigate to="/navigate" replace />,
    },
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
            { path: 'navigate', element: withSuspense(<NavigateAdminPage />) },
            {
              path: 'wayfinding',
              element: <Navigate to="/admin/navigate" replace />,
            },
            {
              path: 'floor-plans',
              element: <Navigate to="/admin/navigate" replace />,
            },
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
