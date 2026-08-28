import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ErrorState, Spinner } from '../components/Feedback'
import { categoryLabel, formatDate, titleCase } from '../lib/format'
import {
  deleteLostFoundItem,
  fetchLostFoundAdmin,
  updateLostFoundItem,
} from '../lib/adminServices'

const statuses = ['open', 'matched', 'resolved', 'closed']

export default function LostFoundAdminPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-lost-found'],
    queryFn: fetchLostFoundAdmin,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateLostFoundItem(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-lost-found'] }),
  })

  const removeMutation = useMutation({
    mutationFn: deleteLostFoundItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-lost-found'] }),
  })

  if (isLoading) return <Spinner />
  if (isError || !data)
    return <ErrorState message="Could not load lost & found reports." />

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Lost &amp; Found</h1>
      <p className="mt-1 text-slate-500">Review and manage student reports.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Title
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Status
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.results.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-400">
                    {categoryLabel(item.category)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.item_type === 'lost'
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {titleCase(item.item_type)}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {item.tracking_code}
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(item.date)}</td>
                <td className="px-4 py-3">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      statusMutation.mutate({ id: item.id, status: e.target.value })
                    }
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs outline-none"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {titleCase(s)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this report?'))
                        removeMutation.mutate(item.id)
                    }}
                    className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.results.length === 0 && (
          <p className="p-6 text-center text-slate-500">No reports yet.</p>
        )}
      </div>
    </div>
  )
}
