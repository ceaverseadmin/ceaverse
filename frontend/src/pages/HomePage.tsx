import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Mail, Phone, Download } from 'lucide-react'
import Icon from '../components/Icon'
import { ErrorState, Spinner } from '../components/Feedback'
import { fetchLandingContent } from '../lib/services'

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['landing'],
    queryFn: fetchLandingContent,
  })

  if (isLoading) return <Spinner />
  if (isError || !data)
    return <ErrorState message="Could not load the portal content." />

  const { hero, about, mission, vision, contact, service_cards, downloadable_links } =
    data

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-300">
            Engineering &amp; Architecture Student Council
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            {hero.title || 'The CEAVERSE Web Portal'}
          </h1>
          {hero.subtitle && (
            <p className="mt-4 max-w-2xl text-lg text-brand-100">{hero.subtitle}</p>
          )}
          {hero.cta_label && (
            <a
              href={hero.cta_url || '#'}
              className="mt-8 inline-block rounded-md bg-white px-6 py-3 font-semibold text-brand-800 hover:bg-brand-50"
            >
              {hero.cta_label}
            </a>
          )}
        </div>
      </section>

      {/* Service cards */}
      {service_cards.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900">What we offer</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {service_cards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {card.icon && (
                  <div className="mb-3 text-brand-600" aria-hidden>
                    <Icon name={card.icon} size={32} />
                  </div>
                )}
                <h3 className="font-semibold text-slate-900">{card.title}</h3>
                {card.description && (
                  <p className="mt-2 text-sm text-slate-600">{card.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About / Mission / Vision */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {about.title || 'About'}
            </h2>
            <p className="mt-3 text-slate-600">{about.content}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
            <p className="mt-3 text-slate-600">{mission.content}</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
            <p className="mt-3 text-slate-600">{vision.content}</p>
          </div>
        </div>
      </section>

      {/* Downloadable links */}
      {downloadable_links.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900">Downloads</h2>
          <div className="mt-6 space-y-3">
            {downloadable_links.map((link) => (
              <a
                key={link.id}
                href={link.file ?? link.external_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow"
              >
                <div>
                  <p className="font-medium text-slate-900">{link.label}</p>
                  {link.description && (
                    <p className="text-sm text-slate-500">{link.description}</p>
                  )}
                </div>
                <span className="text-brand-600 inline-flex items-center gap-1">
                  Download <Download size={16} />
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Contact + CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Get involved</h2>
            <p className="mt-2 max-w-xl text-slate-600">
              Report a lost item, find a room, or share your voice with the council.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/lost-found"
              className="rounded-md bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700"
            >
              Lost &amp; Found
            </Link>
            <Link
              to="/voice"
              className="rounded-md border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              Student Voice
            </Link>
          </div>
        </div>
        {contact.email || contact.phone ? (
          <div className="border-t border-slate-100 bg-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
              {contact.email && (
                <span className="mr-6">
                  <Mail size={16} className="mr-1 align-text-bottom" />
                  {contact.email}
                </span>
              )}
              {contact.phone && (
                <span className="mr-6">
                  <Phone size={16} className="mr-1 align-text-bottom" />
                  {contact.phone}
                </span>
              )}
              {contact.address && <span>{contact.address}</span>}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
