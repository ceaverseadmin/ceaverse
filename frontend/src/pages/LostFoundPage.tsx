import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState, Spinner } from '../components/Feedback'
import { categoryLabel, formatDate, titleCase } from '../lib/format'
import { fetchLostFound } from '../lib/services'

export default function LostFoundPage() {
  const [filter, setFilter] = useState<string>('')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['lost-found', filter],
    queryFn: () => fetchLostFound(filter ? { item_type: filter } : {}),
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lost &amp; Found</h1>
          <p className="mt-2 text-slate-600">
            Lost something? Found something? Help the community reunite.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/lost-found/submit"
            className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
          >
            Report an item
          </Link>
          <Link
            to="/lost-found/track"
            className="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Check a report
          </Link>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'lost', label: 'Lost' },
          { value: 'found', label: 'Found' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              filter === option.value
                ? 'bg-brand-600 text-white'
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
        <p className="mt-10 text-center text-slate-500">No reports yet.</p>
      )}
      {data && data.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.item_type === 'lost'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {titleCase(item.item_type)}
                </span>
                <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {item.description}
                </p>
              )}
              <p className="mt-3 text-sm text-slate-500">
                {categoryLabel(item.category)}
                {item.location ? ` · ${item.location}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
