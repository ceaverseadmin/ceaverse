import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ErrorState, Spinner } from '../components/Feedback'
import { formatDate, titleCase } from '../lib/format'
import { fetchActivityLogs } from '../lib/adminServices'

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'status_change', label: 'Status Change' },
  { value: 'upload', label: 'Upload' },
]

export default function ActivityLogsPage() {
  const [actionFilter, setActionFilter] = useState('')
  const [modelFilter, setModelFilter] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['activity-logs', actionFilter, modelFilter],
    queryFn: () =>
      fetchActivityLogs({
        action: actionFilter || undefined,
        model_name: modelFilter || undefined,
      }),
  })

  const logs = data?.results || []

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
      <p className="mt-1 text-slate-500">
        Audit trail of all system activities and admin actions.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            {actionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
          <input
            type="text"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            placeholder="Filter by model..."
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Could not load activity logs." />}

      {data && logs.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">No activity logs found.</p>
        </div>
      )}

      {data && logs.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">User</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Action</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Model</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Details</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">IP Address</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {log.user?.full_name || 'System'}
                    </p>
                    {log.user?.email && (
                      <p className="text-xs text-slate-500">{log.user.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {titleCase(log.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.model_name || '—'}</td>
                  <td className="px-4 py-3">
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <div className="max-w-xs truncate text-xs text-slate-500">
                        {JSON.stringify(log.details)}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.ip_address || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}