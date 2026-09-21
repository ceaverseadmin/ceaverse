import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center overflow-hidden px-4 py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl"
      />
      <div className="relative">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <Compass className="h-7 w-7" aria-hidden />
        </span>
        <p className="mt-6 bg-gradient-to-br from-brand-600 to-brand-900 bg-clip-text text-6xl font-bold tracking-tight text-transparent">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-600">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
