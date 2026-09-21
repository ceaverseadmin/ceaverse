import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../components/Feedback'
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
  const [category, setCategory] = useState('suggestion')
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
      <PageHeader
        eyebrow="Community"
        title="Student Voice"
        subtitle="Share your thoughts with the council. Messages appear after review."
      />

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-7"
      >
        {posted && (
          <p className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
            Message received! It will appear on the wall after review.
          </p>
        )}
        {mutation.isError && (
          <div className="mb-4">
            <ErrorState
              message={
                mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Could not submit your message. Please try again.'
              }
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              type="button"
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === c.value
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
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
          className="mt-4 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional — stays anonymous if blank)"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:flex-1"
          />
          <button
            type="submit"
            disabled={!content.trim() || mutation.isPending}
            className="rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Submitting…' : 'Share'}
          </button>
        </div>
      </form>

      <div className="mt-10 flex flex-wrap gap-2">
        {[{ value: '', label: 'All' }, ...categories].map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
              category === c.value
                ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
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
        <div className="mt-6">
          <EmptyState
            title="No published messages yet"
            description="Your message could be the first — share what's on your mind."
          />
        </div>
      )}
      <div className="mt-6 space-y-4">
        {data?.map((message) => (
          <div
            key={message.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:border-brand-100"
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
            <p className="mt-3 leading-relaxed text-slate-800">{message.content}</p>
            <p className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-100">
                {message.display_name.charAt(0).toUpperCase()}
              </span>
              {message.display_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
