import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../auth/useAuth'

export default function LoginPage() {
  const { user, isAdmin, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      const from = (location.state as { from?: { pathname: string } } | null)?.from
        ?.pathname
      navigate(from ?? '/admin', { replace: true })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Link
        to="/"
        className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        <span aria-hidden="true">&larr;</span> Home
      </Link>
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <img 
              src="/cea-logo.png" 
              alt="CEAVERSE Logo" 
              className="h-10 w-10 rounded-lg"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin sign in</h1>
              <p className="text-sm text-slate-500">CEAVERSE Web Portal</p>
            </div>
          </div>
          {error && (
            <p className="mb-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/admin/signup" className="font-medium text-brand-600 hover:text-brand-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
