import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ErrorState, Spinner } from '../components/Feedback'
import PdfPreview from '../components/PdfPreview'
import { fetchBuilding, fetchBuildings } from '../lib/services'
import type { BuildingDetail } from '../lib/types'

export default function FloorPlansPage() {
  const {
    data: buildings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
  })
  const firstId = buildings?.results[0]?.id
  const [selected, setSelected] = useState<string | null>(null)
  const activeId = selected ?? firstId ?? null
  const { data: detail } = useQuery({
    queryKey: ['building', activeId],
    queryFn: () => fetchBuilding(activeId!),
    enabled: Boolean(activeId),
  })

  if (isLoading) return <Spinner />
  if (isError || !buildings) {
    return <ErrorState message="Could not load floor plans." />
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">CEA Floor Plans</h1>
      <p className="mt-2 text-slate-600">
        Browse PDF floor plans for each campus building.
      </p>

      {buildings.results.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">
          No floor plans available yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Buildings
            </h2>
            <ul className="mt-3 space-y-1">
              {buildings.results.map((building) => (
                <li key={building.id}>
                  <button
                    onClick={() => setSelected(building.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium ${
                      detail?.id === building.id
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {building.code ? `${building.code} — ` : ''}
                    {building.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section>
            {!detail ? (
              <p className="text-slate-500">
                Select a building to view its floor plans.
              </p>
            ) : (
              <BuildingDetailView key={detail.id} building={detail} />
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function BuildingDetailView({ building }: { building: BuildingDetail }) {
  const [floor, setFloor] = useState<string>(building.floor_plans[0]?.id ?? '')

  if (building.floor_plans.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">{building.name}</h2>
        <p className="mt-2 text-slate-500">
          No floor plans available for this building.
        </p>
      </div>
    )
  }

  const currentFloor =
    building.floor_plans.find((f) => f.id === floor) ?? building.floor_plans[0]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{building.name}</h2>
      {building.description && (
        <p className="mt-1 text-sm text-slate-500">{building.description}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {building.floor_plans.map((f) => (
          <button
            key={f.id}
            onClick={() => setFloor(f.id)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              currentFloor.id === f.id
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.floor_label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <PdfPreview url={currentFloor.file} label={currentFloor.floor_label} />
      </div>
    </div>
  )
}
