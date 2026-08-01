import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState } from '../components/Feedback'
import { submitLostFound } from '../lib/services'
import type { LostFoundSubmission } from '../lib/types'

const categories = [
  { value: 'id_card', label: 'ID Card' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'gadget', label: 'Gadget' },
  { value: 'book', label: 'Book' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'other', label: 'Other' },
]

const inputClass =
  'mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export default function LostFoundSubmitPage() {
  const [form, setForm] = useState({
    item_type: 'lost',
    category: 'id_card',
    title: '',
    description: '',
    location: '',
    date: '',
    contact_name: '',
    contact_email: '',
  })
  const [image, setImage] = useState<File | null>(null)
  const [result, setResult] = useState<LostFoundSubmission | null>(null)

  const mutation = useMutation({
    mutationFn: submitLostFound,
    onSuccess: (data) => setResult(data),
  })

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    if (image) payload.append('image', image)
    mutation.mutate(payload)
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h1 className="text-xl font-bold text-emerald-900">Report received!</h1>
          <p className="mt-2 text-emerald-800">
            Save your tracking code to check the status of your report.
          </p>
          <p className="mt-4 rounded-md bg-white px-4 py-3 text-center font-mono text-lg font-bold text-brand-700">
            {result.tracking_code}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to={`/lost-found/track?code=${result.tracking_code}`}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Check status
            </Link>
            <button
              onClick={() => {
                setResult(null)
                setForm({
                  item_type: 'lost',
                  category: 'id_card',
                  title: '',
                  description: '',
                  location: '',
                  date: '',
                  contact_name: '',
                  contact_email: '',
                })
                setImage(null)
              }}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Report another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        to="/lost-found"
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        ← Back to Lost &amp; Found
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Report an item</h1>
      <p className="mt-2 text-slate-600">
        Tell us what happened so we can help others find or return your item.
      </p>

      {mutation.isError && (
        <div className="mt-4">
          <ErrorState message="Could not submit your report. Please try again." />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
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
          className="w-full rounded-md bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  )
}
