import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Spinner } from '../components/Feedback'

export default function RequireAdmin() {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
