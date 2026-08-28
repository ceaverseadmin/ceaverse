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
    setClickCount(prev => {
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

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div 
          className="flex items-center gap-2 font-semibold text-slate-900 cursor-pointer"
          onClick={() => window.location.href = '/'}
        >
          <img 
            src="/cea-logo.png" 
            alt="CEAVERSE Logo" 
            className={`h-9 w-9 rounded-lg transition-all ${
              clickCount > 0 ? 'scale-110' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation()
              handleLogoClick()
            }}
          />
          <span>
            CEAVERSE
          </span>
        </div>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100'
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
