import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ErrorState, Spinner } from '../components/Feedback'
import { categoryLabel, formatDate } from '../lib/format'
import { fetchVoiceWall, submitVoice } from '../lib/services'

const categories = [
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'compliment', label: 'Compliment' },
  { value: 'concern', label: 'Concern' },
  { value: 'shoutout', label: 'Shoutout' },
]

const categoryColors: Record<string, string> = {
  suggestion: 'bg-brand-100 text-brand-700',
  compliment: 'bg-emerald-100 text-emerald-700',
  concern: 'bg-amber-100 text-amber-700',
  shoutout: 'bg-violet-100 text-violet-700',
}

export default function VoicePage() {
  const [category, setCategory] = useState('')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [posted, setPosted] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['voice', category],
    queryFn: () => fetchVoiceWall(category || undefined),
  })

  const mutation = useMutation({
    mutationFn: submitVoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice'] })
      setPosted(true)
      setName('')
      setContent('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({ category, content, name })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Student Voice</h1>
      <p className="mt-2 text-slate-600">
        Share your thoughts with the council. Messages appear after review.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {posted && (
          <p className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Message received! It will appear on the wall after review.
          </p>
        )}
        {mutation.isError && (
          <div className="mb-4">
            <ErrorState message="Could not submit your message. Please try again." />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              type="button"
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                category === c.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Write your message…"
          className="mt-4 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional — stays anonymous if blank)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:flex-1"
          />
          <button
            type="submit"
            disabled={!content.trim() || mutation.isPending}
            className="rounded-md bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Submitting…' : 'Share'}
          </button>
        </div>
      </form>

      <div className="mt-10 flex gap-2">
        {[{ value: '', label: 'All' }, ...categories].map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              category === c.value
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Could not load the wall." />}
      {data && data.length === 0 && (
        <p className="mt-10 text-center text-slate-500">No published messages yet.</p>
      )}
      <div className="mt-6 space-y-4">
        {data?.map((message) => (
          <div
            key={message.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  categoryColors[message.category] ?? 'bg-slate-100 text-slate-600'
                }`}
              >
                {categoryLabel(message.category)}
              </span>
              <span className="text-xs text-slate-400">
                {formatDate(message.created_at)}
              </span>
            </div>
            <p className="mt-3 text-slate-800">{message.content}</p>
            <p className="mt-3 text-sm font-medium text-slate-500">
              — {message.display_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
