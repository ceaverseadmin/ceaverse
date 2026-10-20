import { useQuery } from '@tanstack/react-query'
import { FileText, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../components/Feedback'
import PdfViewer from '../components/PdfViewer'
import { categoryLabel } from '../lib/format'
import { fetchBuilding, fetchBuildings, fetchLocations } from '../lib/services'

const ALL_BUILDINGS = 'all'

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

const pagerClass =
  'rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-600 transition enabled:hover:bg-slate-50 disabled:opacity-40'

function floorText(floor: string) {
  if (!floor) return '—'
  return /^\d+$/.test(floor) ? `Floor ${floor}` : floor
}

export default function NavigatePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const buildingParam = searchParams.get('building') ?? ''
  const floorParam = searchParams.get('floor') ?? ''
  const parsedPage = Number.parseInt(searchParams.get('page') ?? '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const setParam = (key: string, value: string, replace = false) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        if (key !== 'page') next.delete('page')
        if (key === 'building') next.delete('floor')
        return next
      },
      { replace },
    )
  }

  const {
    data: buildings,
    isLoading: buildingsLoading,
    isError: buildingsError,
  } = useQuery({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
  })

  const allMode = buildingParam === ALL_BUILDINGS
  const selectedBuilding = allMode
    ? null
    : (buildings?.results.find((b) => b.id === buildingParam) ??
      buildings?.results[0] ??
      null)

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['building', selectedBuilding?.id],
    queryFn: () => fetchBuilding(selectedBuilding!.id),
    enabled: Boolean(selectedBuilding?.id),
  })

  const floorPlans = detail?.floor_plans ?? []
  const currentFloor =
    floorPlans.find((plan) => plan.id === floorParam) ?? floorPlans[0]

  const { data, isLoading, isError } = useQuery({
    queryKey: ['locations', search, selectedBuilding?.id ?? '', category, page],
    queryFn: () =>
      fetchLocations({
        search: search || undefined,
        building: selectedBuilding?.id,
        category: category || undefined,
        page,
      }),
    enabled: !buildingsLoading && !buildingsError,
  })

  const buildingNameById = new Map(
    buildings?.results.map((building) => [building.id, building.name]) ?? [],
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        eyebrow="Campus"
        title="Navigate"
        subtitle="Search rooms, labs, and offices, and preview each building's floor plans."
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setParam('search', e.target.value, true)}
            placeholder="Search a room, office, or building…"
            className="w-full rounded-xl border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setParam('category', e.target.value)}
          aria-label="Filter by category"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-56"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {buildingsError && (
        <div className="mt-8">
          <ErrorState message="Could not load campus buildings." />
        </div>
      )}

      {buildingsLoading && <Spinner label="Loading buildings" />}

      {buildings && buildings.results.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No buildings yet"
            description="Campus buildings and floor plans will appear here once added."
          />
        </div>
      )}

      {buildings && buildings.results.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start lg:gap-8">
          <aside>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Buildings
            </h2>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              <button
                onClick={() => setParam('building', ALL_BUILDINGS)}
                aria-pressed={allMode}
                className={`shrink-0 rounded-xl px-3 py-2 text-left text-sm font-medium transition lg:w-full ${
                  allMode
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                All buildings
              </button>
              {buildings.results.map((building) => {
                const active = !allMode && selectedBuilding?.id === building.id
                return (
                  <button
                    key={building.id}
                    onClick={() => setParam('building', building.id)}
                    aria-pressed={active}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition lg:w-full ${
                      active
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {building.code && (
                      <span
                        className={`font-mono text-[10px] font-semibold ${
                          active ? 'text-white/70' : 'text-slate-400'
                        }`}
                      >
                        {building.code}
                      </span>
                    )}
                    <span className="whitespace-nowrap lg:min-w-0 lg:truncate">
                      {building.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="min-w-0 space-y-6">
            {selectedBuilding && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedBuilding.code && (
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 font-mono text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                      {selectedBuilding.code}
                    </span>
                  )}
                  <h2 className="min-w-0 text-lg font-bold break-words text-slate-900 sm:text-xl">
                    {selectedBuilding.name}
                  </h2>
                </div>
                {selectedBuilding.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedBuilding.description}
                  </p>
                )}

                {detailLoading ? (
                  <div className="mt-4 rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-500">
                    Loading floor plans…
                  </div>
                ) : floorPlans.length > 0 ? (
                  <div className="mt-4 grid gap-4 xl:grid-cols-[190px_minmax(0,1fr)] xl:items-start">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Floor plans
                      </p>
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible xl:pb-0">
                        {floorPlans.map((plan) => {
                          const active = currentFloor?.id === plan.id
                          return (
                            <button
                              key={plan.id}
                              onClick={() => setParam('floor', plan.id)}
                              aria-pressed={active}
                              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition xl:w-full ${
                                active
                                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <FileText
                                className={`h-4 w-4 shrink-0 ${
                                  active ? 'text-white/80' : 'text-slate-400'
                                }`}
                                aria-hidden
                              />
                              <span className="whitespace-nowrap xl:whitespace-normal">
                                {plan.floor_label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    {currentFloor && (
                      <div className="min-w-0">
                        <PdfViewer
                          key={currentFloor.id}
                          url={currentFloor.file}
                          title={currentFloor.floor_label}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    No floor plan has been uploaded for this building yet.
                  </p>
                )}
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <h2 className="font-semibold break-words text-slate-900">
                    {allMode
                      ? 'All rooms and facilities'
                      : `Rooms in ${selectedBuilding?.name ?? 'this building'}`}
                  </h2>
                  {allMode && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      Select a building to preview its floor plan.
                    </p>
                  )}
                </div>
                {data && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {data.count}
                  </span>
                )}
              </div>

              {isLoading ? (
                <Spinner label="Loading rooms" />
              ) : isError ? (
                <div className="p-4 sm:p-6">
                  <ErrorState message="Could not load rooms." />
                </div>
              ) : data && data.results.length === 0 ? (
                <div className="p-4 sm:p-6">
                  <EmptyState
                    title="No rooms found"
                    description="Try a different search term, category, or building."
                  />
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data?.results.map((location) => {
                    const meta = [
                      allMode
                        ? (buildingNameById.get(location.building) ??
                          location.building_name)
                        : null,
                      location.code || null,
                    ]
                      .filter(Boolean)
                      .join(' · ')
                    return (
                      <li
                        key={location.id}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-slate-50 sm:flex-nowrap sm:px-6"
                      >
                        <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                          <p className="font-medium text-slate-900">{location.name}</p>
                          {meta && (
                            <p className="truncate text-xs text-slate-400">{meta}</p>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 sm:w-24 sm:shrink-0">
                          {floorText(location.floor)}
                        </p>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 sm:w-28 sm:shrink-0 sm:text-center">
                          {categoryLabel(location.category)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}

              {data && (data.previous || data.next) && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm sm:px-6">
                  <span className="text-slate-500">Page {page}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={!data.previous}
                      onClick={() => setParam('page', String(page - 1))}
                      className={pagerClass}
                    >
                      Previous
                    </button>
                    <button
                      disabled={!data.next}
                      onClick={() => setParam('page', String(page + 1))}
                      className={pagerClass}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
