import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePwaInstall } from '../hooks/usePwaInstall'

export default function PwaInstallPrompt() {
  const { isInstallable, install, isIOS } = usePwaInstall()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!isInstallable || isIOS) return

    // Show modal after 30 seconds
    const timer = setTimeout(() => {
      setShowModal(true)
    }, 30000)

    return () => clearTimeout(timer)
  }, [isInstallable, isIOS])

  if (!showModal) return null

  const handleInstall = async () => {
    await install()
    setShowModal(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Install app"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:left-auto sm:right-6 sm:mx-0"
    >
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Download className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          Install CEAVERSE
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Get the full app experience with offline access and quick home screen
          launch.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            Install
          </button>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Not now
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setShowModal(false)}
        aria-label="Dismiss install prompt"
        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
