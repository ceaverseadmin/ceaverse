import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ErrorState } from '../components/Feedback'
import { categoryLabel, formatDate, titleCase } from '../lib/format'
import { trackLostFound } from '../lib/services'

export default function LostFoundTrackPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') ?? '')

  const { data, isError, isFetching, refetch } = useQuery({
    queryKey: ['track', code],
    queryFn: () => trackLostFound(code),
    enabled: Boolean(code),
    retry: false,
  })

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setSearchParams({ code: code.trim().toUpperCase() })
    refetch()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        to="/lost-found"
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        ← Back to Lost &amp; Found
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Check a report</h1>
      <p className="mt-2 text-slate-600">
        Enter the tracking code you received when you submitted your report.
      </p>

      <form onSubmit={handleLookup} className="mt-6 flex gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. LF-8K3D9QPA"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 font-mono outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={!code.trim() || isFetching}
          className="rounded-md bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isFetching ? 'Checking…' : 'Check'}
        </button>
      </form>

      {isError && (
        <div className="mt-6">
          <ErrorState message="No report found for that tracking code." />
        </div>
      )}

      {data && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                data.item_type === 'lost'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {titleCase(data.item_type)}
            </span>
            <span className="text-sm text-slate-500">{formatDate(data.date)}</span>
          </div>
          <h2 className="mt-3 text-xl font-bold text-slate-900">{data.title}</h2>
          {data.description && (
            <p className="mt-2 text-slate-600">{data.description}</p>
          )}
          <p className="mt-3 text-sm text-slate-500">
            {categoryLabel(data.category)}
            {data.location ? ` · ${data.location}` : ''}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {titleCase(data.status)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Code
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-brand-700">
                {data.tracking_code}
              </p>
            </div>
          </div>

          {(data.contact_name || data.contact_email) && (
            <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-4 text-sm">
              <p className="font-medium text-brand-900">Contact</p>
              <p className="mt-1 text-brand-800">
                {data.contact_name}
                {data.contact_email ? ` · ${data.contact_email}` : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
