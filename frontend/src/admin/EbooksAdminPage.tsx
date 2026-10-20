import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { AdminTablePageSkeleton } from '../components/AdminSkeletons'
import { ErrorState } from '../components/Feedback'
import { Modal } from '../components/Modal'
import { categoryLabel } from '../lib/format'
import {
  createBook,
  deleteBook,
  fetchBooksAdmin,
  updateBook,
} from '../lib/adminServices'
import type { Book } from '../lib/types'

const categoryColumns = [
  { value: 'subject', label: 'Subjects' },
  { value: 'archive', label: 'Archives' },
  { value: 'research', label: 'Research' },
  { value: 'youtube', label: 'Youtube Resources' },
  { value: 'textbook', label: 'Textbooks' },
  { value: 'module', label: 'Modules' },
  { value: 'reference', label: 'References' },
  { value: 'syllabus', label: 'Syllabi' },
]

const yearLevels = ['1st', '2nd', '3rd', '4th', '5th']
const courses = ['BSCpE', 'BSCE', 'BSARCHI', 'BSECE']

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export default function EbooksAdminPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Book | 'new' | null>(null)

  const pageSize = 100

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'admin-books',
      search,
      categoryFilter,
      yearFilter,
      courseFilter,
      statusFilter,
      page,
    ],
    queryFn: () =>
      fetchBooksAdmin({
        search: search || undefined,
        category: categoryFilter || undefined,
        year_level: yearFilter || undefined,
        course: courseFilter || undefined,
        is_active: statusFilter === '' ? undefined : statusFilter === 'true',
        page,
        page_size: pageSize,
      }),
  })

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

  if (isLoading)
    return <AdminTablePageSkeleton columns={7} rows={6} filters={5} actions />
  if (isError || !data) return <ErrorState message="Could not load the library." />

  const totalPages = Math.max(1, Math.ceil(data.count / pageSize))

  const openEditor = (target: Book | 'new') => {
    saveMutation.reset()
    setEditing(target)
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Library</h1>
          <p className="mt-1 text-slate-500">Manage the library catalog.</p>
        </div>
        <button
          onClick={() => openEditor('new')}
          className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
        >
          Add material
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search materials…"
            className={`${inputClass} pl-9`}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setPage(1)
          }}
          className={inputClass}
        >
          <option value="">All sections</option>
          {categoryColumns.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={yearFilter}
          onChange={(e) => {
            setYearFilter(e.target.value)
            setPage(1)
          }}
          className={inputClass}
        >
          <option value="">All years</option>
          {yearLevels.map((y) => (
            <option key={y} value={y}>
              {y} Year
            </option>
          ))}
        </select>
        <select
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value)
            setPage(1)
          }}
          className={inputClass}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className={inputClass}
        >
          <option value="">Any status</option>
          <option value="true">Active</option>
          <option value="false">Hidden</option>
        </select>
      </div>

      {editing && (
        <Modal
          title={editing === 'new' ? 'Add material' : 'Edit material'}
          size="xl"
          onClose={() => setEditing(null)}
        >
          <BookForm
            key={editing === 'new' ? 'new' : editing.id}
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
        </Modal>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
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
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Year</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Course
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
                <td className="px-4 py-3 text-slate-600">{book.year_level || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{book.course || '—'}</td>
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
                      onClick={() => openEditor(book)}
                      className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${book.title}"?`))
                          removeMutation.mutate(book.id)
                      }}
                      className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50"
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
          <p className="p-6 text-center text-slate-500">No materials found.</p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span>
          {data.count} material{data.count === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
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
    year_level: book?.year_level ?? '',
    course: book?.course ?? '',
    pages: book?.pages?.toString() ?? '',
    order: book?.order?.toString() ?? '0',
    is_active: book?.is_active ?? true,
    url: book?.url ?? '',
  })
  const [cover, setCover] = useState<File | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const isYoutube = form.category === 'youtube'
  const fileRequired = !book && !isYoutube && !form.url.trim()

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'pages' && value === '') return
      fd.append(key, String(value))
    })
    if (cover) fd.append('cover', cover)
    if (file) fd.append('file', file)
    onSubmit(fd)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <p className="mb-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          Could not save. Check the required fields and that the PDF file is valid.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
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
          {categoryColumns.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={form.year_level}
          onChange={(e) => update('year_level', e.target.value)}
          className={inputClass}
        >
          <option value="">Year Level</option>
          {yearLevels.map((y) => (
            <option key={y} value={y}>
              {y} Year
            </option>
          ))}
        </select>
        <select
          value={form.course}
          onChange={(e) => update('course', e.target.value)}
          className={inputClass}
        >
          <option value="">Course</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
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
        <input
          type="url"
          placeholder={
            isYoutube ? 'YouTube / external URL (required)' : 'External URL (optional)'
          }
          required={isYoutube}
          value={form.url}
          onChange={(e) => update('url', e.target.value)}
          className={`${inputClass} sm:col-span-2`}
        />
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
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            PDF file{' '}
            {isYoutube
              ? '(optional for Youtube resources)'
              : book
                ? '(leave empty to keep current)'
                : ''}
          </label>
          <input
            type="file"
            accept="application/pdf"
            required={fileRequired}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={`${inputClass} w-full`}
          />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {book ? 'Save changes' : 'Add material'}
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
