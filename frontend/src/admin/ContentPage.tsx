import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../components/Icon'
import { ErrorState, Spinner } from '../components/Feedback'
import {
  createDownloadableLink,
  createServiceCard,
  deleteDownloadableLink,
  deleteServiceCard,
  fetchDownloadableLinks,
  fetchSection,
  fetchServiceCards,
  updateSection,
} from '../lib/adminServices'
import { availableIcons } from '../lib/icons'
import type { AboutSection, ContactSection, Hero, SimpleSection } from '../lib/types'

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

const tabs = [
  'Hero',
  'About',
  'Mission',
  'Vision',
  'Contact',
  'Service Cards',
  'Downloadable Links',
]

export default function ContentPage() {
  const [tab, setTab] = useState('Hero')

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Site Content</h1>
      <p className="mt-1 text-slate-500">Edit landing page sections and resources.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === t
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'Hero' && <SectionForm path="hero" />}
        {tab === 'About' && <SectionForm path="about" />}
        {tab === 'Mission' && <SectionForm path="mission" simple />}
        {tab === 'Vision' && <SectionForm path="vision" simple />}
        {tab === 'Contact' && <SectionForm path="contact" />}
        {tab === 'Service Cards' && <ServiceCardsManager />}
        {tab === 'Downloadable Links' && <DownloadableLinksManager />}
      </div>
    </div>
  )
}

function SectionForm({ path, simple }: { path: string; simple?: boolean }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['section', path],
    queryFn: () =>
      fetchSection<Hero | AboutSection | ContactSection | SimpleSection>(path),
  })

  if (isLoading) return <Spinner />
  if (isError || !data)
    return <ErrorState message={`Could not load ${path} section.`} />

  return <SectionFormBody key={path} path={path} simple={simple} data={data} />
}

const heroFields = ['title', 'subtitle', 'cta_label', 'cta_url']
const aboutFields = ['title', 'content']
const simpleFields = ['content']
const contactFields = ['email', 'phone', 'address', 'map_link', 'working_hours']

function SectionFormBody({
  path,
  simple,
  data,
}: {
  path: string
  simple?: boolean
  data: Hero | AboutSection | ContactSection | SimpleSection
}) {
  const queryClient = useQueryClient()
  const fields = simple
    ? simpleFields
    : path === 'hero'
      ? heroFields
      : path === 'about'
        ? aboutFields
        : contactFields

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(
      fields.map((f) => [
        f,
        String((data as unknown as Record<string, unknown>)[f] ?? ''),
      ]),
    ),
  )
  const [isActive, setIsActive] = useState(
    path === 'hero' ? Boolean((data as Hero).is_active) : true,
  )
  const [image, setImage] = useState<File | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: FormData) => updateSection(path, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['section', path] }),
  })

  const update = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(values).forEach(([key, value]) => fd.append(key, value))
    if (path === 'hero') fd.append('is_active', String(isActive))
    if (image) fd.append('image', image)
    mutation.mutate(fd)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-semibold capitalize text-slate-900">{path} section</h2>
      {mutation.isSuccess && (
        <p className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Saved.
        </p>
      )}
      {mutation.isError && (
        <p className="mt-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          Could not save.
        </p>
      )}
      <div className="mt-4 grid gap-4">
        {fields.map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium capitalize text-slate-700">
              {key.replace(/_/g, ' ')}
            </label>
            <textarea
              rows={key === 'content' || key === 'address' ? 4 : 2}
              value={values[key]}
              onChange={(e) => update(key, e.target.value)}
              className={`${inputClass} mt-1 w-full`}
            />
          </div>
        ))}
        {path === 'hero' && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            Show hero section
          </label>
        )}
        {!simple && path !== 'contact' && (
          <div>
            <label className="block text-sm font-medium text-slate-700">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className={`${inputClass} mt-1 w-full`}
            />
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Save changes
        </button>
      </div>
    </form>
  )
}

function ServiceCardsManager() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['service-cards'],
    queryFn: fetchServiceCards,
  })
  const [showForm, setShowForm] = useState(false)

  const removeMutation = useMutation({
    mutationFn: deleteServiceCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-cards'] }),
  })

  if (isLoading) return <Spinner />
  if (isError || !data) return <ErrorState message="Could not load service cards." />

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? 'Close' : 'Add card'}
        </button>
      </div>
      {showForm && <ServiceCardForm onDone={() => setShowForm(false)} />}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {data.results.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 flex items-center gap-1">
                <Icon name={card.icon} size={16} />
              </span>
              <button
                onClick={() => {
                  if (window.confirm('Delete this card?'))
                    removeMutation.mutate(card.id)
                }}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Delete
              </button>
            </div>
            <p className="mt-2 font-semibold text-slate-900">{card.title}</p>
            <p className="mt-1 text-sm text-slate-600">{card.description}</p>
          </div>
        ))}
        {data.results.length === 0 && (
          <p className="col-span-2 rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No service cards yet.
          </p>
        )}
      </div>
    </div>
  )
}

function ServiceCardForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createServiceCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-cards'] })
      onDone()
    },
  })
  const [form, setForm] = useState({ icon: 'book', title: '', description: '', order: '0' })
  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate({ ...form, order: Number(form.order), is_active: true })
      }}
      className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
          <select
            required
            value={form.icon}
            onChange={(e) => update('icon', e.target.value)}
            className={inputClass}
          >
            {availableIcons.map((icon) => (
              <option key={icon.name} value={icon.name}>
                {icon.label}
              </option>
            ))}
          </select>
        </div>
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className={inputClass}
        />
        <input
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className={`${inputClass} sm:col-span-2`}
        />
        <input
          type="number"
          placeholder="Order"
          value={form.order}
          onChange={(e) => update('order', e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="mt-4">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Add card
        </button>
      </div>
    </form>
  )
}

function DownloadableLinksManager() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['downloadable-links'],
    queryFn: fetchDownloadableLinks,
  })
  const [showForm, setShowForm] = useState(false)

  const removeMutation = useMutation({
    mutationFn: deleteDownloadableLink,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['downloadable-links'] }),
  })

  if (isLoading) return <Spinner />
  if (isError || !data)
    return <ErrorState message="Could not load downloadable links." />

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? 'Close' : 'Add link'}
        </button>
      </div>
      {showForm && <DownloadableLinkForm onDone={() => setShowForm(false)} />}
      <div className="mt-4 space-y-3">
        {data.results.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold text-slate-900">{link.label}</p>
              <p className="text-sm text-slate-600">{link.description}</p>
              <p className="mt-1 text-xs text-slate-400">
                {link.external_url
                  ? `External: ${link.external_url}`
                  : 'PDF attachment'}
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Delete this link?')) removeMutation.mutate(link.id)
              }}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
        {data.results.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No downloadable links yet.
          </p>
        )}
      </div>
    </div>
  )
}

function DownloadableLinkForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: createDownloadableLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloadable-links'] })
      onDone()
    },
  })
  const [form, setForm] = useState({
    label: '',
    description: '',
    external_url: '',
    order: '0',
  })
  const [file, setFile] = useState<File | null>(null)
  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData()
        Object.entries(form).forEach(([key, value]) => fd.append(key, value))
        if (file) fd.append('file', file)
        mutation.mutate(fd)
      }}
      className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          required
          placeholder="Label"
          value={form.label}
          onChange={(e) => update('label', e.target.value)}
          className={inputClass}
        />
        <input
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="External URL (optional)"
          value={form.external_url}
          onChange={(e) => update('external_url', e.target.value)}
          className={inputClass}
        />
        <input
          type="number"
          placeholder="Order"
          value={form.order}
          onChange={(e) => update('order', e.target.value)}
          className={inputClass}
        />
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            PDF file (or external URL)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={`${inputClass} w-full`}
          />
        </div>
      </div>
      <div className="mt-4">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Add link
        </button>
      </div>
    </form>
  )
}
