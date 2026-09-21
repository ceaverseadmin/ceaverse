import type { ReactNode } from 'react'
import { AlertTriangle, Inbox } from 'lucide-react'

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16"
      role="status"
      aria-label={label}
    >
      <span className="relative h-9 w-9" aria-hidden>
        <span className="absolute inset-0 rounded-full border-2 border-brand-100" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
      </span>
      <span className="text-sm text-slate-500">{label}…</span>
    </div>
  )
}

export function ErrorState({
  message = 'Something went wrong.',
}: {
  message?: string
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/80 p-4 text-sm text-brand-800"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
      <p>{message}</p>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        <Inbox className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-4 font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}
