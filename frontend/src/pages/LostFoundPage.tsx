import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { ErrorState, EmptyState, PageHeader, Spinner } from '../components/Feedback'
import { categoryLabel, formatDate, titleCase } from '../lib/format'
import { claimLostFound, fetchLostFound } from '../lib/services'
import type { LostFoundItem } from '../lib/types'

const filters = [
  { value: '', label: 'All', params: {} },
  { value: 'lost', label: 'Lost', params: { item_type: 'lost' } },
  { value: 'found', label: 'Found', params: { item_type: 'found' } },
  { value: 'claimed', label: 'Claimed', params: { status: 'resolved' } },
]

export default function LostFoundPage() {
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<LostFoundItem | null>(null)
  const queryClient = useQueryClient()
  const active = filters.find((f) => f.value === filter) ?? filters[0]
  const { data, isLoading, isError } = useQuery({
    queryKey: ['lost-found', active.value],
    queryFn: () => fetchLostFound(active.params),
  })

  const claimMutation = useMutation({
    mutationFn: claimLostFound,
    onSuccess: () => {
      setSelected(null)
      queryClient.invalidateQueries({ queryKey: ['lost-found', active.value] })
    },
  })

  const handleClaim = () => {
    if (!selected) return
    if (window.confirm('Mark this item as claimed?')) claimMutation.mutate(selected.id)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        eyebrow="Community"
        title="Lost &amp; Found"
        subtitle="Lost something? Found something? Help the community reunite."
        actions={
          <>
            <Link
              to="/lost-found/submit"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
            >
              Report an item
            </Link>
            <Link
              to="/lost-found/track"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Check a report
            </Link>
          </>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              filter === option.value
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Could not load reports." />}
      {data && data.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No reports yet"
            description="Be the first to lend a hand — report a lost or found item."
            action={
              <Link
                to="/lost-found/submit"
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Report an item
              </Link>
            }
          />
        </div>
      )}
      {data && data.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => {
            const claimed = item.status === 'resolved'
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className={`group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  claimed
                    ? 'opacity-60 transition hover:opacity-80'
                    : 'transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.item_type === 'lost'
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {titleCase(item.item_type)}
                  </span>
                  {claimed && (
                    <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                      Claimed
                      {item.claimed_at ? ` · ${formatDate(item.claimed_at)}` : ''}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-slate-400">
                    {formatDate(item.date)}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 transition group-hover:text-brand-700">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {item.description}
                  </p>
                )}
                <p className="mt-3 text-sm text-slate-500">
                  {categoryLabel(item.category)}
                  {item.location ? ` · ${item.location}` : ''}
                </p>
              </button>
            )
          })}
        </div>
      )}

      {selected && (
        <ItemDetailModal
          item={selected}
          claiming={claimMutation.isPending}
          onClose={() => setSelected(null)}
          onClaim={handleClaim}
        />
      )}
    </div>
  )
}

function ItemDetailModal({
  item,
  claiming,
  onClose,
  onClaim,
}: {
  item: LostFoundItem
  claiming: boolean
  onClose: () => void
  onClaim: () => void
}) {
  const claimed = item.status === 'resolved'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                item.item_type === 'lost'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {titleCase(item.item_type)}
            </span>
            {claimed && (
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                Claimed
              </span>
            )}
            <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            className={`h-56 w-full object-cover ${claimed ? 'opacity-60' : ''}`}
          />
        )}

        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {categoryLabel(item.category)}
            {item.location ? ` · ${item.location}` : ''}
          </p>
          {item.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {item.description}
            </p>
          )}

          {claimed && item.claimed_at && (
            <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Claimed on {formatDate(item.claimed_at)}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
            {!claimed ? (
              <button
                onClick={onClaim}
                disabled={claiming}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:opacity-50"
              >
                {claiming ? 'Claiming…' : 'Claimed'}
              </button>
            ) : (
              <button
                disabled
                className="cursor-not-allowed rounded-xl bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700"
              >
                Already claimed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
