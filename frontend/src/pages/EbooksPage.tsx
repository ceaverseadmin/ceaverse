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

const yearLevels = [
  { value: '', label: 'All Years' },
  { value: '1st', label: '1st' },
  { value: '2nd', label: '2nd' },
  { value: '3rd', label: '3rd' },
  { value: '4th', label: '4th' },
  { value: '5th', label: '5th' },
]

const courses = [
  { value: '', label: 'All Courses' },
  { value: 'BSCpE', label: 'BSCpE' },
  { value: 'BSCE', label: 'BSCE' },
  { value: 'BSARCHI', label: 'BSARCHI' },
  { value: 'BSECE', label: 'BSECE' },
]

export default function EbooksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''
  const yearLevel = searchParams.get('year_level') ?? ''
  const course = searchParams.get('course') ?? ''
  const search = searchParams.get('search') ?? ''

  const { data, isLoading, isError } = useQuery({
    queryKey: ['library', category, yearLevel, course, search],
    queryFn: () =>
      fetchBooks({
        category: category || undefined,
        year_level: yearLevel || undefined,
        course: course || undefined,
        search: search || undefined,
      }),
  })

  const setParam = (key: string, value: string) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Library</h1>
      <p className="mt-2 text-slate-600">
        Free reference materials, modules, and syllabi for EA students.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setParam('category', c.value)}
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
            onChange={(e) => setParam('search', e.target.value)}
            placeholder="Search materials…"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {yearLevels.map((y) => (
            <button
              key={y.value}
              onClick={() => setParam('year_level', y.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium ${
                yearLevel === y.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {y.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {courses.map((c) => (
            <button
              key={c.value}
              onClick={() => setParam('course', c.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium ${
                course === c.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Could not load the library catalog." />}
      {data && data.results.length === 0 && (
        <p className="mt-10 text-center text-slate-500">No materials found.</p>
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
