import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Home, LibraryBig, Map, MessageSquareText, PackageSearch } from 'lucide-react'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/library', label: 'Library', icon: LibraryBig },
  { to: '/lost-found', label: 'Lost & Found', icon: PackageSearch },
  { to: '/voice', label: 'Student Voice', icon: MessageSquareText },
  { to: '/navigate', label: 'Navigate', icon: Map },
]

export default function Navbar() {
  const [clickCount, setClickCount] = useState(0)

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
      </nav>
    </header>
  )
}
