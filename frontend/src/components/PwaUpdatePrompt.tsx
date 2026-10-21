import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:left-auto sm:right-6 sm:mx-0"
    >
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <RefreshCw className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          A new version is available
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Refresh to load the latest portal updates.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            Refresh now
          </button>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Later
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        aria-label="Dismiss update prompt"
        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
