import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ErrorState, Spinner } from '../components/Feedback'
import { categoryLabel, formatDate } from '../lib/format'
import {
  createBook,
  deleteBook,
  fetchBooksAdmin,
  updateBook,
} from '../lib/adminServices'
import type { Book } from '../lib/types'

const categories = ['textbook', 'module', 'reference', 'syllabus']

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export default function EbooksAdminPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-books'],
    queryFn: fetchBooksAdmin,
  })
  const [editing, setEditing] = useState<Book | 'new' | null>(null)

  const saveMutation = useMutation({
    mutationFn: ({ id, form }: { id?: string; form: FormData }) =>
      id ? updateBook(id, form) : createBook(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-books'] })
      setEditing(null)
    },
  })

  const removeMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-books'] }),
  })

  if (isLoading) return <Spinner />
  if (isError || !data) return <ErrorState message="Could not load ebooks." />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ebooks</h1>
          <p className="mt-1 text-slate-500">Manage the ebook catalog.</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
        >
          Add ebook
        </button>
      </div>

      {editing && (
        <BookForm
          book={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSubmit={(form) =>
            saveMutation.mutate({
              id: editing === 'new' ? undefined : editing.id,
              form,
            })
          }
          error={saveMutation.isError}
        />
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Title
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Author
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Category
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Status
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.results.map((book) => (
              <tr key={book.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{book.title}</td>
                <td className="px-4 py-3 text-slate-600">{book.author || '—'}</td>
                <td className="px-4 py-3 text-slate-600">
                  {categoryLabel(book.category)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      book.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {book.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => setEditing(book)}
                      className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${book.title}"?`))
                          removeMutation.mutate(book.id)
                      }}
                      className="rounded-md px-2 py-1 font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.results.length === 0 && (
          <p className="p-6 text-center text-slate-500">No ebooks yet.</p>
        )}
      </div>
      {data.results.length > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          Added {formatDate(data.results[0].created_at)} · last updated{' '}
          {formatDate(data.results[0].updated_at)}
        </p>
      )}
    </div>
  )
}

function BookForm({
  book,
  onSubmit,
  onCancel,
  error,
}: {
  book: Book | null
  onSubmit: (form: FormData) => void
  onCancel: () => void
  error: boolean
}) {
  const [form, setForm] = useState({
    title: book?.title ?? '',
    author: book?.author ?? '',
    description: book?.description ?? '',
    category: book?.category ?? 'textbook',
    pages: book?.pages?.toString() ?? '',
    order: book?.order?.toString() ?? '0',
    is_active: book?.is_active ?? true,
  })
  const [cover, setCover] = useState<File | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)))
    if (cover) fd.append('cover', cover)
    if (file) fd.append('file', file)
    onSubmit(fd)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-semibold text-slate-900">
        {book ? 'Edit ebook' : 'Add ebook'}
      </h2>
      {error && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not save. Check the PDF file is valid and all required fields are set.
        </p>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Author"
          value={form.author}
          onChange={(e) => update('author', e.target.value)}
          className={inputClass}
        />
        <select
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
          className={inputClass}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Pages"
          value={form.pages}
          onChange={(e) => update('pages', e.target.value)}
          className={inputClass}
        />
        <input
          type="number"
          placeholder="Order"
          value={form.order}
          onChange={(e) => update('order', e.target.value)}
          className={inputClass}
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update('is_active', e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Visible to students
        </label>
        <div className="sm:col-span-2">
          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Cover image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            PDF file {book ? '(leave empty to keep current)' : ''}
          </label>
          <input
            type="file"
            accept="application/pdf"
            required={!book}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={`${inputClass} w-full`}
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {book ? 'Save changes' : 'Add ebook'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
