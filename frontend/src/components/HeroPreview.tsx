import {
  BookOpen,
  Building2,
  CheckCircle2,
  Megaphone,
  PackageSearch,
  Search,
} from 'lucide-react'

const navigation = [
  { label: 'Library', icon: BookOpen, active: true },
  { label: 'Lost & Found', icon: PackageSearch, active: false },
  { label: 'Navigate', icon: Building2, active: false },
  { label: 'Voice', icon: Megaphone, active: false },
]

const materials = [
  {
    title: 'Calculus I',
    meta: 'BSCE · 1st year',
    tone: 'from-brand-500 to-brand-700',
  },
  {
    title: 'Architectural Design',
    meta: 'BSARCHI · 2nd year',
    tone: 'from-brand-400 to-brand-600',
  },
  {
    title: 'Physics for Engineers',
    meta: 'BSCpE · 1st year',
    tone: 'from-brand-600 to-brand-900',
  },
  {
    title: 'Data Structures',
    meta: 'BSCpE · 3rd year',
    tone: 'from-brand-300 to-brand-500',
  },
]

export function HeroPreview() {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-md select-none lg:max-w-none"
    >
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-brand-500/25 via-brand-400/10 to-transparent blur-2xl" />

      <div className="relative rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl shadow-black/50 backdrop-blur-sm">
        <div className="overflow-hidden rounded-xl bg-slate-50 ring-1 ring-black/5">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5">
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            </span>
            <span className="ml-2 flex flex-1 items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
              <Search className="h-3 w-3" />
              ceaverse.app/library
            </span>
          </div>

          <div className="grid grid-cols-[86px_1fr] sm:grid-cols-[96px_1fr]">
            <div className="border-r border-slate-200 bg-white p-2">
              <div className="mb-3 flex items-center gap-1.5 px-1">
                <span className="grid h-5 w-5 place-items-center rounded bg-brand-600 text-[9px] font-bold text-white">
                  C
                </span>
                <span className="truncate text-[10px] font-bold tracking-tight text-slate-800">
                  CEAVERSE
                </span>
              </div>
              <div className="space-y-1">
                {navigation.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[9px] font-medium ${
                      item.active ? 'bg-brand-50 text-brand-700' : 'text-slate-500'
                    }`}
                  >
                    <item.icon className="h-3 w-3" />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-brand-600">
                    Library
                  </p>
                  <p className="text-[13px] font-bold tracking-tight text-slate-900">
                    Study materials
                  </p>
                </div>
                <span className="rounded-md bg-brand-600 px-2 py-1 text-[8px] font-semibold text-white">
                  Add
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {['All', 'Subjects', 'Research', 'Youtube'].map((chip, index) => (
                  <span
                    key={chip}
                    className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${
                      index === 0
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-slate-500 ring-1 ring-slate-200'
                    }`}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                {materials.map((material) => (
                  <div
                    key={material.title}
                    className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm"
                  >
                    <div
                      className={`relative mb-1.5 h-14 rounded-md bg-gradient-to-br ${material.tone}`}
                    >
                      <span className="absolute left-1 top-1 rounded bg-white/25 px-1 py-0.5 text-[7px] font-semibold uppercase tracking-wide text-white">
                        PDF
                      </span>
                      <BookOpen className="absolute bottom-1 right-1 h-3 w-3 text-white/70" />
                    </div>
                    <p className="truncate text-[9px] font-semibold text-slate-800">
                      {material.title}
                    </p>
                    <p className="truncate text-[7px] text-slate-400">
                      {material.meta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 top-20 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-soft sm:flex">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-semibold text-slate-900">Lost item matched</p>
          <p className="text-[9px] text-slate-500">Brown wallet · Canteen</p>
        </div>
      </div>

      <div className="absolute -left-4 bottom-10 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-soft sm:flex">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
          <Building2 className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-semibold text-slate-900">Room 204</p>
          <p className="text-[9px] text-slate-500">Engineering Bldg · 2F</p>
        </div>
      </div>
    </div>
  )
}
