import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-slate-900">EA-CSC Web Portal</p>
          <p className="mt-2 text-sm text-slate-500">
            The official portal of the Engineering &amp; Architecture organization.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Resources</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            <li>
              <Link className="hover:text-brand-700" to="/ebooks">
                Ebooks
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand-700" to="/floor-plans">
                Floor Plans
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand-700" to="/wayfinding">
                Wayfinding
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Community</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            <li>
              <Link className="hover:text-brand-700" to="/lost-found">
                Lost &amp; Found
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand-700" to="/voice">
                Student Voice
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Engineering &amp; Architecture Student Council
      </div>
    </footer>
  )
}
