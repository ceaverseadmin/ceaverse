import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { requestPasswordReset } from '../lib/adminServices'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await requestPasswordReset(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
                  Forgot Password
                </h1>
                <p className="text-sm text-slate-500">CEAVERSE Web Portal</p>
              </div>
            </div>

            {success ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-lg font-semibold text-slate-900">
                  Reset Link Sent
                </h2>
                <p className="mb-6 text-sm text-slate-600">
                  If that email is registered, we've sent a password reset link. Please check your inbox.
                </p>
                <Link
                  to="/admin/login"
                  className="inline-flex w-full justify-center rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
                >
                  Back to Login
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
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:opacity-50"
                  >
                    {submitting ? 'Sending…' : 'Send Reset Link'}
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
