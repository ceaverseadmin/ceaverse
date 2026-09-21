import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Download,
  Eye,
  FileDown,
  Info,
  Target,
  type LucideIcon,
} from 'lucide-react'
import Icon from '../components/Icon'
import { ErrorState, Spinner } from '../components/Feedback'
import { fetchLandingContent } from '../lib/services'

function SectionHeading({
  eyebrow,
  title,
  align = 'left',
}: {
  eyebrow: string
  title: string
  align?: 'left' | 'center'
}) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {title}
      </h2>
    </div>
  )
}

function FeatureColumn({
  icon: IconComponent,
  eyebrow,
  title,
  content,
}: {
  icon: LucideIcon
  eyebrow: string
  title: string
  content: string
}) {
  return (
    <div className="group">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white">
        <IconComponent className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-900">{title}</h2>
      <p className="mt-3 leading-relaxed text-slate-600">{content}</p>
    </div>
  )
}

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['landing'],
    queryFn: fetchLandingContent,
  })

  if (isLoading) return <Spinner />
  if (isError || !data)
    return <ErrorState message="Could not load the portal content." />

  const { hero, about, mission, vision, service_cards, downloadable_links } = data

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.07),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-600/40 bg-brand-900/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            Engineering &amp; Architecture Student Council
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            {hero.title || 'The CEAVERSE Web Portal'}
          </h1>
          {hero.subtitle && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100/90">
              {hero.subtitle}
            </p>
          )}
          {hero.cta_label && (
            <a
              href={hero.cta_url || '#'}
              className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-brand-900 shadow-lg shadow-black/20 transition hover:bg-brand-50"
            >
              {hero.cta_label}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </a>
          )}
        </div>
      </section>

      {/* Service cards */}
      {service_cards.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <SectionHeading eyebrow="Services" title="What we offer" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {service_cards.map((card) => (
              <div
                key={card.id}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover"
              >
                {card.icon && (
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon name={card.icon} size={24} />
                  </div>
                )}
                <h3 className="font-semibold text-slate-900">{card.title}</h3>
                {card.description && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {card.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About / Mission / Vision */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-3 md:py-20">
          <FeatureColumn
            icon={Info}
            eyebrow="Who we are"
            title={about.title || 'About'}
            content={about.content}
          />
          <FeatureColumn
            icon={Target}
            eyebrow="Our mission"
            title="Our Mission"
            content={mission.content}
          />
          <FeatureColumn
            icon={Eye}
            eyebrow="Our vision"
            title="Our Vision"
            content={vision.content}
          />
        </div>
      </section>

      {/* Downloadable links */}
      {downloadable_links.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <SectionHeading eyebrow="Resources" title="Downloads" />
          <div className="mt-8 space-y-3">
            {downloadable_links.map((link) => (
              <a
                key={link.id}
                href={link.file ?? link.external_url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-card-hover sm:p-5"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white">
                    <FileDown className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{link.label}</p>
                    {link.description && (
                      <p className="text-sm text-slate-500">{link.description}</p>
                    )}
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 transition group-hover:gap-2">
                  Download <Download className="h-4 w-4" aria-hidden />
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 px-8 py-12 text-white shadow-card-hover md:flex md:items-center md:justify-between">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Get involved
              </h2>
              <p className="mt-2 max-w-xl text-brand-100">
                Report a lost item, find a room, or share your voice with the council.
              </p>
            </div>
            <div className="relative mt-6 flex flex-wrap gap-3 md:mt-0">
              <Link
                to="/lost-found"
                className="rounded-xl bg-white px-6 py-3 font-semibold text-brand-900 transition hover:bg-brand-50"
              >
                Lost &amp; Found
              </Link>
              <Link
                to="/voice"
                className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Student Voice
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
