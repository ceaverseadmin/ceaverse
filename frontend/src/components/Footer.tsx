import { Link } from 'react-router-dom'
import { Globe, Mail } from 'lucide-react'

function FacebookIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-brand-800 bg-brand-700 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-white">CEAVERSE Web Portal</p>
          <p className="mt-2 text-sm text-white/75">
            A joint project of Engineering and Architecture - College Student
            Council (EA-CSC) together with Institute of Computer Engineers of the
            Philippines. Student Edition - CatSU Chapter (ICPEP.SE CatSU)
          </p>
          <div className="mt-4">
            <a
              href="mailto:ceaverseadmin@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-white/75 transition hover:text-white"
            >
              <Mail className="h-4 w-4" />
              <span>ceaverseadmin@gmail.com</span>
            </a>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <a
              href="https://www.facebook.com/profile.php?id=61577939823028"
              target="_blank"
              rel="noreferrer"
              aria-label="EA-CSC on Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white hover:text-white"
            >
              <img src="/eacsc.png" alt="EA-CSC Logo" className="h-7 w-7 rounded-full bg-white object-contain" />
            </a>
            <a
              href="https://www.facebook.com/Icpep.seCatSu"
              target="_blank"
              rel="noreferrer"
              aria-label="ICpEP.SE CatSU Chapter on Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white hover:text-white"
            >
              <img src="/icpep.png" alt="ICpEP Logo" className="h-7 w-7 object-contain" />
            </a>
            <div className="ml-1 flex items-center gap-2">
              <a
                href="https://www.facebook.com/profile.php?id=61577939823028"
                target="_blank"
                rel="noreferrer"
                aria-label="CEAVERSE on Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white hover:text-white"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="CEAVERSE website"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-white hover:text-white"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">Resources</p>
          <ul className="mt-2 space-y-1 text-sm text-white/75">
            <li>
              <Link className="hover:text-white" to="/library">
                Library
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/floor-plans">
                Floor Plans
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/wayfinding">
                Wayfinding
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">Community</p>
          <ul className="mt-2 space-y-1 text-sm text-white/75">
            <li>
              <Link className="hover:text-white" to="/lost-found">
                Lost &amp; Found
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/voice">
                Student Voice
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 md:flex-row md:gap-3">
          <p>© 2026</p>
          <span className="flex items-center gap-1.5">
            <a
              href="https://www.facebook.com/profile.php?id=61577939823028"
              target="_blank"
              rel="noreferrer"
              aria-label="EA-CSC on Facebook"
              className="hover:text-white"
            >
              EA-CSC
            </a>
            <span className="text-white/60">x</span>
            <a
              href="https://www.facebook.com/Icpep.seCatSu"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              ICpEP.SE CatSU Chapter
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
