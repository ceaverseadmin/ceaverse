import { useQuery } from '@tanstack/react-query'
import { Activity, LibraryBig, Map, Route, Users, type LucideIcon } from 'lucide-react'
import { ErrorState, Spinner } from '../components/Feedback'
import { formatDate, titleCase } from '../lib/format'
import { fetchDashboard } from '../lib/adminServices'

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  })

  if (isLoading) return <Spinner />
  if (isError || !data) return <ErrorState message="Could not load the dashboard." />

  const { counts } = data
  const statCards: { label: string; value: number; icon: LucideIcon }[] = [
    { label: 'Users', value: counts.users.total, icon: Users },
    { label: 'Library', value: counts.books, icon: LibraryBig },
    { label: 'Buildings', value: counts.buildings, icon: Map },
    { label: 'Locations', value: counts.locations, icon: Route },
  ]

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      <p className="mt-1 text-slate-500">Overview of portal activity.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {card.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-semibold text-slate-900">Lost &amp; Found</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <Stat label="Open" value={counts.lost_found.open} />
            <Stat label="Matched" value={counts.lost_found.matched} />
            <Stat label="Resolved" value={counts.lost_found.resolved} />
            <Stat label="Total" value={counts.lost_found.total} />
          </dl>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-semibold text-slate-900">Student Voice</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <Stat label="Pending" value={counts.voice.pending} />
            <Stat label="Published" value={counts.voice.published} />
            <Stat label="Rejected" value={counts.voice.rejected} />
            <Stat label="Total" value={counts.voice.total} />
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Activity className="h-4 w-4 text-brand-600" aria-hidden />
          Recent activity
        </h2>
        {data.recent_activity.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No recent activity.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {data.recent_activity.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium text-slate-900">
                    {log.user?.full_name || 'System'}
                  </span>
                  <span className="text-slate-500"> · {titleCase(log.action)}</span>
                  {log.model_name && (
                    <span className="text-slate-400"> · {log.model_name}</span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatDate(log.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 transition hover:bg-brand-50 hover:ring-brand-100">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-bold tracking-tight text-slate-900">{value}</dd>
    </div>
  )
}
