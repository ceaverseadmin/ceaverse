import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', end: true },
  { to: '/admin/ebooks', label: 'Ebooks' },
  { to: '/admin/lost-found', label: 'Lost & Found' },
  { to: '/admin/voice', label: 'Student Voice' },
  { to: '/admin/content', label: 'Site Content' },
  { to: '/admin/floor-plans', label: 'Floor Plans' },
  { to: '/admin/wayfinding', label: 'Wayfinding' },
  { to: '/admin/users', label: 'Users', superOnly: true },
]

export default function AdminLayout() {
  const { user, logout, isSuperAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-slate-900 text-slate-200">
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            EA
          </span>
          <div>
            <p className="text-sm font-semibold text-white">EA-CSC Admin</p>
            <p className="text-xs text-slate-400">{user?.role.replace('_', ' ')}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {links
            .filter((link) => !link.superOnly || isSuperAdmin)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <Link
            to="/"
            className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            ← View site
          </Link>
          <button
            onClick={handleLogout}
            className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm text-red-300 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  )
}
