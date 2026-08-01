import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import BookCard from '../components/BookCard'
import { ErrorState, Spinner } from '../components/Feedback'
import { fetchBooks } from '../lib/services'

const categories = [
  { value: '', label: 'All' },
  { value: 'textbook', label: 'Textbooks' },
  { value: 'module', label: 'Modules' },
  { value: 'reference', label: 'References' },
  { value: 'syllabus', label: 'Syllabi' },
]

export default function EbooksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''
  const search = searchParams.get('search') ?? ''

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ebooks', category, search],
    queryFn: () =>
      fetchBooks({ category: category || undefined, search: search || undefined }),
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Ebooks</h1>
      <p className="mt-2 text-slate-600">
        Free reference materials, modules, and syllabi for EA students.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev)
                  if (c.value) next.set('category', c.value)
                  else next.delete('category')
                  return next
                })
              }
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ${
                category === c.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) =>
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev)
              if (e.target.value) next.set('search', e.target.value)
              else next.delete('search')
              return next
            })
          }
          placeholder="Search ebooks…"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-64"
        />
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Could not load the ebook catalog." />}
      {data && data.results.length === 0 && (
        <p className="mt-10 text-center text-slate-500">No ebooks found.</p>
      )}
      {data && data.results.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
