import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Icon from '../components/Icon'
import {
  ContentFormSkeleton,
  DownloadableLinksSkeleton,
  ServiceCardsSkeleton,
} from '../components/AdminSkeletons'
import { ErrorState } from '../components/Feedback'
import {
  createDownloadableLink,
  createServiceCard,
  deleteDownloadableLink,
  deleteServiceCard,
  fetchDownloadableLinks,
  fetchSection,
  fetchServiceCards,
  updateDownloadableLink,
  updateSection,
  updateServiceCard,
  type ServiceCardPayload,
} from '../lib/adminServices'
import { availableIcons } from '../lib/icons'
import type {
  AboutSection,
  ContactSection,
  DownloadableLink,
  Hero,
  ServiceCard,
  SimpleSection,
} from '../lib/types'

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

const primaryButtonClass =
  'rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50'

const secondaryButtonClass =
  'rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'

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

  if (isLoading) return <ContentFormSkeleton />
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

  const imageField =
    path === 'hero' ? 'background_image' : path === 'about' ? 'image' : null
  const existingImage = imageField
    ? (((data as unknown as Record<string, unknown>)[imageField] as
        string | null | undefined) ?? null)
    : null

  const [image, setImage] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [preview, setPreview] = useState<string | null>(existingImage)

  useEffect(() => {
    if (!image) {
      setPreview(removeImage ? null : existingImage)
      return
    }
    const url = URL.createObjectURL(image)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [image, removeImage, existingImage])

  const mutation = useMutation({
    mutationFn: (payload: FormData) => updateSection(path, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section', path] })
      setImage(null)
      setRemoveImage(false)
      setFileInputKey((key) => key + 1)
    },
  })

  const update = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(values).forEach(([key, value]) => fd.append(key, value))
    if (path === 'hero') fd.append('is_active', String(isActive))
    if (imageField) {
      if (image) fd.append(imageField, image)
      else if (removeImage) fd.append('remove_image', 'true')
    }
    mutation.mutate(fd)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
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
        {imageField && (
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {imageField === 'background_image' ? 'Background image' : 'Image'}
            </label>
            {preview && (
              <div className="relative mt-2 inline-block">
                <img
                  src={preview}
                  alt="Current section image"
                  className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null)
                    setRemoveImage(true)
                    setFileInputKey((key) => key + 1)
                  }}
                  aria-label="Remove image"
                  title="Remove image"
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow hover:bg-slate-700"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            )}
            {removeImage && (
              <p className="mt-1 text-xs text-brand-700">
                Image will be removed when you save.
              </p>
            )}
            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files?.[0] ?? null)
                setRemoveImage(false)
              }}
              className={`${inputClass} mt-2 w-full`}
            />
            {preview && (
              <p className="mt-1 text-xs text-slate-500">
                Choose a new file to replace it, or use the X to remove it.
              </p>
            )}
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className={primaryButtonClass}
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
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceCard | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (card: ServiceCard) => {
    setEditing(card)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const removeMutation = useMutation({
    mutationFn: deleteServiceCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service-cards'] }),
  })

  if (isLoading) return <ServiceCardsSkeleton />
  if (isError || !data) return <ErrorState message="Could not load service cards." />

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => (formOpen ? closeForm() : openCreate())}
          className={primaryButtonClass}
        >
          {formOpen ? 'Close' : 'Add card'}
        </button>
      </div>
      {formOpen && (
        <ServiceCardForm key={editing?.id ?? 'new'} card={editing} onDone={closeForm} />
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {data.results.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                <Icon name={card.icon} size={16} />
              </span>
              <div className="flex shrink-0 items-center gap-2">
                {!card.is_active && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    Hidden
                  </span>
                )}
                <button
                  onClick={() => openEdit(card)}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this card?'))
                      removeMutation.mutate(card.id)
                  }}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-2 font-semibold text-slate-900">{card.title}</p>
            <p className="mt-1 text-sm break-words text-slate-600">
              {card.description}
            </p>
          </div>
        ))}
        {data.results.length === 0 && (
          <p className="col-span-full rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No service cards yet.
          </p>
        )}
      </div>
    </div>
  )
}

function ServiceCardForm({
  card,
  onDone,
}: {
  card: ServiceCard | null
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: ServiceCardPayload) =>
      card ? updateServiceCard(card.id, payload) : createServiceCard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-cards'] })
      onDone()
    },
  })
  const [form, setForm] = useState({
    icon: card?.icon ?? 'book',
    title: card?.title ?? '',
    description: card?.description ?? '',
    order: card?.order?.toString() ?? '0',
    is_active: card?.is_active ?? true,
  })
  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate({
          icon: form.icon,
          title: form.title,
          description: form.description,
          order: Number(form.order),
          is_active: form.is_active,
        })
      }}
      className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <h3 className="font-semibold text-slate-900">
        {card ? 'Edit service card' : 'Add service card'}
      </h3>
      {mutation.isError && (
        <p className="mt-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          Could not save this card.
        </p>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Icon</label>
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
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Display order
          </label>
          <input
            type="number"
            placeholder="0"
            value={form.order}
            onChange={(e) => update('order', e.target.value)}
            className={`${inputClass} w-full`}
          />
          <p className="mt-1 text-xs text-slate-500">Lower numbers appear first.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:mt-6">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="h-4 w-4 accent-brand-600"
          />
          Visible on the site
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className={primaryButtonClass}
        >
          {card ? 'Save changes' : 'Add card'}
        </button>
        <button type="button" onClick={onDone} className={secondaryButtonClass}>
          Cancel
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
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DownloadableLink | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (link: DownloadableLink) => {
    setEditing(link)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditing(null)
  }

  const removeMutation = useMutation({
    mutationFn: deleteDownloadableLink,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['downloadable-links'] }),
  })

  if (isLoading) return <DownloadableLinksSkeleton />
  if (isError || !data)
    return <ErrorState message="Could not load downloadable links." />

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => (formOpen ? closeForm() : openCreate())}
          className={primaryButtonClass}
        >
          {formOpen ? 'Close' : 'Add link'}
        </button>
      </div>
      {formOpen && (
        <DownloadableLinkForm
          key={editing?.id ?? 'new'}
          link={editing}
          onDone={closeForm}
        />
      )}
      <div className="mt-4 space-y-3">
        {data.results.map((link) => (
          <div
            key={link.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{link.label}</p>
                {!link.is_active && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    Hidden
                  </span>
                )}
              </div>
              {link.description && (
                <p className="text-sm break-words text-slate-600">{link.description}</p>
              )}
              <p className="mt-1 truncate text-xs text-slate-400">
                {link.external_url
                  ? `External: ${link.external_url}`
                  : link.file
                    ? 'PDF attachment'
                    : 'No file or URL'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => openEdit(link)}
                className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Delete this link?'))
                    removeMutation.mutate(link.id)
                }}
                className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
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

function DownloadableLinkForm({
  link,
  onDone,
}: {
  link: DownloadableLink | null
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: FormData) =>
      link ? updateDownloadableLink(link.id, payload) : createDownloadableLink(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloadable-links'] })
      onDone()
    },
  })
  const [form, setForm] = useState({
    label: link?.label ?? '',
    description: link?.description ?? '',
    external_url: link?.external_url ?? '',
    order: link?.order?.toString() ?? '0',
    is_active: link?.is_active ?? true,
  })
  const [file, setFile] = useState<File | null>(null)
  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData()
        fd.append('label', form.label)
        fd.append('description', form.description)
        fd.append('external_url', form.external_url)
        fd.append('order', form.order)
        fd.append('is_active', String(form.is_active))
        if (file) fd.append('file', file)
        mutation.mutate(fd)
      }}
      className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <h3 className="font-semibold text-slate-900">
        {link ? 'Edit downloadable link' : 'Add downloadable link'}
      </h3>
      {mutation.isError && (
        <p className="mt-2 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          Could not save this link. Provide a PDF file or an external URL.
        </p>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Label</label>
          <input
            required
            placeholder="Label"
            value={form.label}
            onChange={(e) => update('label', e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            External URL
          </label>
          <input
            placeholder="https://example.com"
            value={form.external_url}
            onChange={(e) => update('external_url', e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Display order
          </label>
          <input
            type="number"
            placeholder="0"
            value={form.order}
            onChange={(e) => update('order', e.target.value)}
            className={`${inputClass} w-full`}
          />
          <p className="mt-1 text-xs text-slate-500">Lower numbers appear first.</p>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            PDF file{link ? ' (optional)' : ' (or external URL)'}
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={`${inputClass} mt-1 w-full`}
          />
          {link && (
            <p className="mt-1 text-xs text-slate-500">
              {link.file ? (
                <>
                  Leave empty to keep the current PDF.{' '}
                  <a
                    href={link.file}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-brand-600 hover:text-brand-700"
                  >
                    View current PDF
                  </a>
                </>
              ) : (
                'Leave empty to keep using the external URL.'
              )}
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="h-4 w-4 accent-brand-600"
          />
          Visible on the site
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className={primaryButtonClass}
        >
          {link ? 'Save changes' : 'Add link'}
        </button>
        <button type="button" onClick={onDone} className={secondaryButtonClass}>
          Cancel
        </button>
      </div>
    </form>
  )
}
