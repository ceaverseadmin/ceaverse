import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await fetch('/api/auth/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: fullName,
          password,
          password_confirm: passwordConfirm,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/admin/login')
        }, 3000)
      } else {
        setError(data.message || 'Could not create account')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 text-center">
              <img 
                src="/cea-logo.png" 
                alt="CEAVERSE Logo" 
                className="mx-auto mb-4 h-12 w-12 rounded-lg"
              />
              <h1 className="text-lg font-bold text-slate-900">Account Created!</h1>
              <p className="mt-2 text-sm text-slate-600">
                Your account has been created and is pending approval from a super admin.
                You will be redirected to the login page shortly.
              </p>
            </div>
            <Link
              to="/admin/login"
              className="block w-full rounded-md bg-brand-600 px-4 py-2.5 text-center font-semibold text-white hover:bg-brand-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <img 
              src="/cea-logo.png" 
              alt="CEAVERSE Logo" 
              className="h-10 w-10 rounded-lg"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin Sign Up</h1>
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
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
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
              <label className="block text-sm font-medium text-slate-700">Password</label>
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
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/admin/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-slate-500">
            Note: New accounts require approval from a super admin before activation.
          </p>
        </div>
      </div>
    </div>
  )
}