import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../auth/useAuth'

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', end: true },
  { to: '/admin/library', label: 'Library' },
  { to: '/admin/lost-found', label: 'Lost & Found' },
  { to: '/admin/voice', label: 'Student Voice' },
  { to: '/admin/content', label: 'Site Content' },
  { to: '/admin/floor-plans', label: 'Floor Plans' },
  { to: '/admin/wayfinding', label: 'Wayfinding' },
  { to: '/admin/admin', label: 'Admin Management', superOnly: true },
  { to: '/admin/users', label: 'Users', superOnly: true },
  { to: '/admin/activity-logs', label: 'Activity Logs', superOnly: true },
  { to: '/admin/profile', label: 'Profile' },
]

export default function AdminLayout() {
  const { user, logout, isSuperAdmin } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/admin/login')
  }

  const close = () => setOpen(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-brand-900 px-4 text-white lg:hidden">
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-1 text-slate-200 hover:bg-brand-800"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <span className="text-sm font-semibold">CEAVERSE Admin</span>
      </header>

      {/* Sidebar backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-brand-900 text-slate-200 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-brand-800 px-5">
          <img
            src="/cea-logo.png"
            alt="CEAVERSE Logo"
            className="h-8 w-8 rounded-lg"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              CEAVERSE Admin
            </p>
            <p className="truncate text-xs text-slate-400">
              {user?.role.replace('_', ' ')}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {links
            .filter((link) => !link.superOnly || isSuperAdmin)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={close}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-brand-800 text-white'
                      : 'text-slate-300 hover:bg-brand-800 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
        </nav>
        <div className="shrink-0 border-t border-brand-800 p-3">
          <Link
            to="/"
            onClick={close}
            className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-brand-800"
          >
            ← View site
          </Link>
          <button
            onClick={handleLogout}
            className="mt-0.5 block w-full rounded-md px-3 py-2 text-left text-sm text-brand-300 hover:bg-brand-800"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="lg:ml-60">
        <Outlet />
      </main>
    </div>
  )
}
