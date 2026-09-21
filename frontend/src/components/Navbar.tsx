import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/library', label: 'Library' },
  { to: '/lost-found', label: 'Lost & Found' },
  { to: '/voice', label: 'Student Voice' },
  { to: '/floor-plans', label: 'Floor Plans' },
  { to: '/wayfinding', label: 'Wayfinding' },
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
    `rounded-lg px-3.5 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-white/10 text-white ring-1 ring-white/15'
        : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-brand-900/60 bg-brand-950/90 shadow-lg shadow-brand-950/20 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
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
          <span className="text-lg tracking-tight">CEAVERSE</span>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-white/5 px-4 py-2 md:hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-white/10 text-white ring-1 ring-white/15'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
