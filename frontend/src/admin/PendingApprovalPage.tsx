import { useAuth } from '../auth/useAuth'

export default function PendingApprovalPage() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-8 w-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Account Pending Approval</h1>
            <p className="mt-2 text-sm text-slate-600">
              Your account is currently pending approval from a super admin.
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Account Details:</p>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Name:</span> {user?.full_name}</p>
              <p><span className="font-medium">Role:</span> {user?.role?.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-brand-50 p-4">
            <p className="text-sm text-brand-800">
              <strong>What happens next?</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-brand-700 list-disc list-inside">
              <li>A super admin will review your admin account request</li>
              <li>You will receive an email once your account is approved</li>
              <li>This usually takes 1-2 business days</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-md bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700"
          >
            Refresh Status
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                window.location.href = '/admin/login'
              }
            }}
            className="mt-3 w-full rounded-md border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}