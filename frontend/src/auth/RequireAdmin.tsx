import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { AdminBootSkeleton } from '../components/AdminSkeletons'

export default function RequireAdmin() {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) return <AdminBootSkeleton />
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/" replace />
  if (user && !user.is_active) return <Navigate to="/admin/pending-approval" replace />

  return <Outlet />
}
