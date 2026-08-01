import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { ErrorState, Spinner } from '../components/Feedback'
import { categoryLabel } from '../lib/format'
import { fetchBuildings, fetchLocations } from '../lib/services'

const categoryOptions = [
  { value: '', label: 'All categories' },
  { value: 'classroom', label: 'Classrooms' },
  { value: 'laboratory', label: 'Laboratories' },
  { value: 'office', label: 'Offices' },
  { value: 'service', label: 'Service' },
  { value: 'entrance', label: 'Entrances' },
  { value: 'restroom', label: 'Restrooms' },
  { value: 'other', label: 'Other' },
]

export default function WayfindingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const building = searchParams.get('building') ?? ''
  const category = searchParams.get('category') ?? ''

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['locations', search, building, category],
    queryFn: () =>
      fetchLocations({
        search: search || undefined,
        building: building || undefined,
        category: category || undefined,
      }),
  })

  const updateParam = (key: string, value: string) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Wayfinding</h1>
      <p className="mt-2 text-slate-600">
        Find classrooms, labs, offices, and facilities across the campus.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => updateParam('search', e.target.value)}
          placeholder="Search a room, office, or building…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <select
          value={building}
          onChange={(e) => updateParam('building', e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All buildings</option>
          {buildings?.results.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          {categoryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message="Could not load locations." />}
      {data && data.results.length === 0 && (
        <p className="mt-10 text-center text-slate-500">No locations found.</p>
      )}
      {data && data.results.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Building
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Floor
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.results.map((location) => (
                <tr key={location.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{location.name}</p>
                    {location.code && (
                      <p className="font-mono text-xs text-slate-400">
                        {location.code}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{location.building_name}</td>
                  <td className="px-4 py-3 text-slate-600">{location.floor || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {categoryLabel(location.category)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
