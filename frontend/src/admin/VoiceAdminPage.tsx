import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ErrorState, Spinner } from '../components/Feedback'
import { categoryLabel, formatDate } from '../lib/format'
import {
  deleteVoiceSubmission,
  fetchVoiceSubmissions,
  updateVoiceSubmission,
} from '../lib/adminServices'

export default function VoiceAdminPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-voice'],
    queryFn: fetchVoiceSubmissions,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateVoiceSubmission(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-voice'] }),
  })

  const removeMutation = useMutation({
    mutationFn: deleteVoiceSubmission,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-voice'] }),
  })

  if (isLoading) return <Spinner />
  if (isError || !data)
    return <ErrorState message="Could not load voice submissions." />

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">Student Voice</h1>
      <p className="mt-1 text-slate-500">Moderate the message queue.</p>

      <div className="mt-6 space-y-3">
        {data.results.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No submissions yet.
          </p>
        )}
        {data.results.map((submission) => (
          <div
            key={submission.id}
            className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
              submission.status === 'rejected' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {categoryLabel(submission.category)}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    submission.status === 'published'
                      ? 'bg-emerald-100 text-emerald-700'
                      : submission.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {submission.status}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(submission.created_at)}
                </span>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() =>
                    statusMutation.mutate({ id: submission.id, status: 'published' })
                  }
                  disabled={submission.status === 'published'}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  Publish
                </button>
                <button
                  onClick={() =>
                    statusMutation.mutate({ id: submission.id, status: 'rejected' })
                  }
                  disabled={submission.status === 'rejected'}
                  className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 disabled:opacity-40"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this message?'))
                      removeMutation.mutate(submission.id)
                  }}
                  className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-3 text-slate-800">{submission.content}</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              — {submission.display_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
