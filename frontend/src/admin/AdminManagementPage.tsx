import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ErrorState, Spinner } from '../components/Feedback'
import { formatDate } from '../lib/format'
import { approveUser, fetchPendingUsers, rejectUser } from '../lib/adminServices'

export default function AdminManagementPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pending-users'],
    queryFn: fetchPendingUsers,
  })

  const approveMutation = useMutation({
    mutationFn: (userId: string) => approveUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => rejectUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
    },
  })

  if (isLoading) return <Spinner />
  if (isError) return <ErrorState message="Could not load pending admin signups." />

  const pendingUsers = data || []

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
      <p className="mt-1 text-slate-500">
        Review and approve new admin account requests. All signups require super admin approval.
      </p>

      {pendingUsers.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">No pending admin signups.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {pendingUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{user.full_name}</h3>
                  <p className="truncate text-sm text-slate-600">{user.email}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Applied: {formatDate(user.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm(`Approve ${user.email}?`)) {
                        approveMutation.mutate(user.id)
                      }
                    }}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Reject ${user.email}? This cannot be undone.`)) {
                        rejectMutation.mutate(user.id)
                      }
                    }}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="rounded-md border border-brand-300 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}