import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Download, Home, LibraryBig, Map, MessageSquareText, PackageSearch, Plus, Share, X } from 'lucide-react'
import { usePwaInstall } from '../hooks/usePwaInstall'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/library', label: 'Library', icon: LibraryBig },
  { to: '/lost-found', label: 'Lost & Found', icon: PackageSearch },
  { to: '/voice', label: 'Student Voice', icon: MessageSquareText },
  { to: '/navigate', label: 'Navigate', icon: Map },
]

export default function Navbar() {
  const [clickCount, setClickCount] = useState(0)
  const { isInstallable, install, isIOS, isInstalled } = usePwaInstall()
  const [showiOSModal, setShowiOSModal] = useState(false)

  const handleLogoClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1

      // Reset counter after 3 seconds if no more clicks
      setTimeout(() => setClickCount(0), 3000)

      if (newCount >= 5) {
        window.location.href = '/admin/login'
        return 0
      }
      return newCount
    })
  }

  // clickCount is used for Easter egg functionality (redirect to admin after 5 clicks)

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowiOSModal(true)
    } else {
      await install()
    }
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition lg:gap-2 lg:px-3.5 lg:text-sm ${
      isActive
        ? 'bg-white/10 text-white ring-1 ring-white/15'
        : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-brand-900/60 bg-brand-950/90 shadow-lg shadow-brand-950/20 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-4">
        <div
          className="flex cursor-pointer items-center gap-2.5 font-semibold text-white"
          onClick={() => (window.location.href = '/')}
        >
          <img
            src="/cea-logo.png"
            alt="CEAVERSE Logo"
            className={`h-9 w-9 rounded-xl ring-1 ring-white/20 transition-all ${
              clickCount > 0 ? 'scale-110 ring-white' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation()
              handleLogoClick()
            }}
          />
          <span className="text-base tracking-tight sm:text-lg">CEAVERSE</span>
        </div>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {link.label}
              </NavLink>
            )
          })}
          {(isInstallable || isIOS) && !isInstalled && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-white/70 transition hover:bg-white/5 hover:text-white lg:gap-2 lg:px-3.5 lg:text-sm"
              aria-label="Install app"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden lg:inline">Install</span>
            </button>
          )}
        </nav>
      </div>
      <nav
        aria-label="Mobile navigation"
        className="nav-scrollbar flex items-center gap-1 overflow-x-auto border-t border-white/5 px-3 py-2 md:hidden"
      >
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white ring-1 ring-white/15'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {link.label}
            </NavLink>
          )
        })}
        {(isInstallable || isIOS) && !isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
            aria-label="Install app"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            <span>Install</span>
          </button>
        )}
      </nav>

      {showiOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowiOSModal(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-soft outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Install CEAVERSE
              </h2>
              <button
                type="button"
                onClick={() => setShowiOSModal(false)}
                aria-label="Close"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Install CEAVERSE on your iOS device for quick access and offline
                support.
              </p>

              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">Tap the Share button</p>
                    <p className="mt-0.5 text-slate-500">
                      In Safari, tap the Share icon in the address bar
                    </p>
                  </div>
                  <Share className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                </li>

                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    2
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">
                      Scroll down and tap "Add to Home Screen"
                    </p>
                    <p className="mt-0.5 text-slate-500">
                      Find this option in the share menu
                    </p>
                  </div>
                  <Plus className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
                </li>

                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">Tap "Add" in the top right</p>
                    <p className="mt-0.5 text-slate-500">
                      Confirm to add CEAVERSE to your home screen
                    </p>
                  </div>
                </li>
              </ol>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowiOSModal(false)}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
