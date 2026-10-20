import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import BookCard from '../components/BookCard'
import { EmptyState, ErrorState, PageHeader } from '../components/Feedback'
import { EbooksPageSkeleton } from '../components/PublicSkeletons'
import { fetchBooks } from '../lib/services'

const categories = [
  { value: '', label: 'All' },
  { value: 'subject', label: 'Subjects' },
  { value: 'archive', label: 'Archives' },
  { value: 'research', label: 'Research' },
  { value: 'youtube', label: 'Youtube Resources' },
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
      <PageHeader
        eyebrow="Digital Library"
        title="Library"
        subtitle="Free reference materials, modules, and syllabi for EA students."
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          value={category}
          onChange={(e) => setParam('category', e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={yearLevel}
          onChange={(e) => setParam('year_level', e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {yearLevels.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
        <select
          value={course}
          onChange={(e) => setParam('course', e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {courses.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <div className="relative sm:ml-auto">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setParam('search', e.target.value)}
            placeholder="Search materials…"
            className="w-full rounded-xl border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-64"
          />
        </div>
      </div>

      {isLoading && <EbooksPageSkeleton />}
      {isError && <ErrorState message="Could not load the library catalog." />}
      {data && data.results.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No materials found"
            description="Try adjusting your filters or search term."
          />
        </div>
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
