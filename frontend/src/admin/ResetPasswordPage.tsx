import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react'
import { confirmPasswordReset } from '../lib/adminServices'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if missing uid or token
  useEffect(() => {
    if (!uid || !token) {
      navigate('/admin/forgot-password')
    }
  }, [uid, token, navigate])

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please use a stronger password.')
      return
    }

    if (!uid || !token) {
      setError('Invalid reset link.')
      return
    }

    setSubmitting(true)

    try {
      await confirmPasswordReset(uid, token, newPassword)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!uid || !token) {
    return null
  }

  return (
    <div className="relative flex min-h-screen bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-brand-950 p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(255,255,255,0.06),transparent_55%)]" />
        <div className="relative flex items-center gap-3">
          <img
            src="/cea-logo.png"
            alt="CEAVERSE Logo"
            className="h-10 w-10 rounded-xl ring-1 ring-white/20"
          />
          <span className="text-lg font-semibold tracking-tight">CEAVERSE</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            The home of the Engineering &amp; Architecture Student Council.
          </h1>
          <p className="mt-4 text-brand-100/90">
            Manage ebooks, campus navigation, lost &amp; found, and student voice — all
            in one place.
          </p>
        </div>
        <p className="relative text-xs text-brand-200/70">
          © 2026 CEAVERSE · EA-CSC x ICpEP.SE CatSU
        </p>
      </div>

      {/* Form side */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-16">
        <Link
          to="/admin/login"
          className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-card transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Login
        </Link>
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card sm:p-9">
            <div className="mb-6 flex items-center gap-3">
              <img
                src="/cea-logo.png"
                alt="CEAVERSE Logo"
                className="h-11 w-11 rounded-xl ring-1 ring-brand-100 lg:hidden"
              />
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Reset Password
                </h1>
                <p className="text-sm text-slate-500">CEAVERSE Web Portal</p>
              </div>
            </div>

            {success ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">
                  Password Reset Successful
                </h2>
                <p className="mb-6 text-sm text-slate-600">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
                <Link
                  to="/admin/login"
                  className="inline-flex w-full justify-center rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <p className="mb-4 rounded-xl bg-brand-50 px-3 py-2.5 text-sm text-brand-700 ring-1 ring-brand-100">
                    {error}
                  </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      New Password
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full rounded-xl border border-slate-300 px-3 py-2 pr-10 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-2">
                        <div className="mb-1 flex h-1.5 gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-full flex-1 rounded-full ${
                                i < passwordStrength ? strengthColor[passwordStrength] : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          Password strength: <span className="font-medium">{strengthLabel[passwordStrength]}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Confirm Password
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-xl border border-slate-300 px-3 py-2 pr-10 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div className="mt-2 flex items-center gap-1 text-xs">
                        {newPassword === confirmPassword ? (
                          <>
                            <Check className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 text-red-600" />
                            <span className="text-red-600">Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || passwordStrength < 3 || newPassword !== confirmPassword}
                    className="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:opacity-50"
                  >
                    {submitting ? 'Resetting…' : 'Reset Password'}
                  </button>
                </form>
                <p className="mt-4 text-center text-sm text-slate-600">
                  Remember your password?{' '}
                  <Link
                    to="/admin/login"
                    className="font-medium text-brand-600 transition hover:text-brand-700"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
