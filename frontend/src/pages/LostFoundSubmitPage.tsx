import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { ErrorState, PageHeader } from '../components/Feedback'
import { submitLostFound } from '../lib/services'

const categories = [
  { value: 'id_card', label: 'ID Card' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'gadget', label: 'Gadget' },
  { value: 'book', label: 'Book' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'other', label: 'Other' },
]

const initialForm = {
  item_type: 'lost',
  category: 'id_card',
  title: '',
  description: '',
  location: '',
  date: '',
  contact_name: '',
  contact_email: '',
}

const inputClass =
  'mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export default function LostFoundSubmitPage() {
  const [form, setForm] = useState(initialForm)
  const [image, setImage] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: submitLostFound,
    onSuccess: () => {
      setSubmitted(true)
      queryClient.invalidateQueries({ queryKey: ['lost-found'] })
    },
  })

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const resetForm = () => {
    setForm(initialForm)
    setImage(null)
    setSubmitted(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    if (image) payload.append('image', image)
    mutation.mutate(payload)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        to="/lost-found"
        className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
      >
        ← Back to Lost &amp; Found
      </Link>
      <PageHeader
        title="Report an item"
        subtitle="Tell us what happened so we can help others find or return your item."
      />

      {mutation.isError && (
        <div className="mt-4">
          <ErrorState message="Could not submit your report. Please try again." />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Report type
            </label>
            <select
              value={form.item_type}
              onChange={(e) => update('item_type', e.target.value)}
              className={inputClass}
            >
              <option value="lost">I lost an item</option>
              <option value="found">I found an item</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Black wallet near the canteen"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            placeholder="Any distinguishing details that could help identify it."
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Location</label>
            <input
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Where?"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Your name
            </label>
            <input
              value={form.contact_name}
              onChange={(e) => update('contact_name', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Your email
            </label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => update('contact_email', e.target.value)}
              placeholder="So people can reach you"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Submitting…' : 'Submit report'}
        </button>
      </form>

      {submitted && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={resetForm}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-soft sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button
                onClick={resetForm}
                aria-label="Close"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-emerald-900">Report received!</h2>
            <p className="mt-2 text-sm text-slate-600">
              Your item is now visible in the Lost &amp; Found list.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate('/lost-found')}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
              >
                View in Lost &amp; Found
              </button>
              <button
                onClick={resetForm}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Report another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
