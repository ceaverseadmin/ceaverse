import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-slate-900">CEAVERSE Web Portal</p>
          <p className="mt-2 text-sm text-slate-500">
            The official portal of the Engineering &amp; Architecture organization.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Resources</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-500">
            <li>
              <Link className="hover:text-brand-700" to="/library">
                Library
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
        <p>© {new Date().getFullYear()}</p>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          <img src="/eacsc.png" alt="EA-CSC Logo" className="h-3.5 w-3.5 object-contain" />
          EA-CSC
          <span className="text-slate-300">x</span>
          ICpEP.SE CatSU Chapter
          <img src="/icpep.png" alt="ICpEP Logo" className="h-3.5 w-3.5 object-contain" />
        </div>
      </div>
    </footer>
  )
}
