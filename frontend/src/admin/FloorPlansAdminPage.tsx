import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ErrorState, Spinner } from '../components/Feedback'
import {
  createBuilding,
  createFloorPlan,
  deleteBuilding,
  deleteFloorPlan,
  fetchBuildingsAdmin,
  fetchFloorPlansAdmin,
  updateBuilding,
} from '../lib/adminServices'
import type { Building } from '../lib/types'

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export default function FloorPlansAdminPage() {
  const [tab, setTab] = useState<'buildings' | 'floor-plans'>('buildings')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">Floor Plans</h1>
      <p className="mt-1 text-slate-500">Manage buildings and their floor plan PDFs.</p>

      <div className="mt-6 flex gap-2">
        {(['buildings', 'floor-plans'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'buildings' ? <BuildingsSection /> : <FloorPlansSection />}
      </div>
    </div>
  )
}

function BuildingsSection() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-buildings'],
    queryFn: fetchBuildingsAdmin,
  })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Building | null>(null)

  const removeMutation = useMutation({
    mutationFn: deleteBuilding,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-buildings'] }),
  })

  if (isLoading) return <Spinner />
  if (isError || !data) return <ErrorState message="Could not load buildings." />

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditing(null)
            setShowForm((v) => !v)
          }}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm && !editing ? 'Close' : 'Add building'}
        </button>
      </div>
      {(showForm || editing) && (
        <BuildingForm building={editing} onDone={() => setShowForm(false)} />
      )}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Status
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.results.map((building) => (
              <tr key={building.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {building.name}
                </td>
                <td className="px-4 py-3 text-slate-500">{building.code || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      building.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {building.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => {
                        setEditing(building)
                        setShowForm(true)
                      }}
                      className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete "${building.name}" and its floor plans?`,
                          )
                        )
                          removeMutation.mutate(building.id)
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
          <p className="p-6 text-center text-slate-500">No buildings yet.</p>
        )}
      </div>
    </div>
  )
}

function BuildingForm({
  building,
  onDone,
}: {
  building: Building | null
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: building?.name ?? '',
    code: building?.code ?? '',
    description: building?.description ?? '',
    order: building?.order?.toString() ?? '0',
    is_active: building?.is_active ?? true,
  })
  const [image, setImage] = useState<File | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: FormData) =>
      building ? updateBuilding(building.id, payload) : createBuilding(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-buildings'] })
      onDone()
    },
  })

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)))
    if (image) fd.append('image', image)
    mutation.mutate(fd)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-semibold text-slate-900">
        {building ? 'Edit building' : 'Add building'}
      </h2>
      {mutation.isError && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not save.
        </p>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <input
          required
          placeholder="Building name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Code (e.g. ENG)"
          value={form.code}
          onChange={(e) => update('code', e.target.value)}
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
            rows={2}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className={`${inputClass} w-full`}
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {building ? 'Save changes' : 'Add building'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function FloorPlansSection() {
  const queryClient = useQueryClient()
  const buildings = useQuery({
    queryKey: ['admin-buildings'],
    queryFn: fetchBuildingsAdmin,
  })
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-floor-plans'],
    queryFn: fetchFloorPlansAdmin,
  })
  const [showForm, setShowForm] = useState(false)

  const removeMutation = useMutation({
    mutationFn: deleteFloorPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-floor-plans'] }),
  })

  if (isLoading || buildings.isLoading) return <Spinner />
  if (isError || !data || buildings.isError || !buildings.data)
    return <ErrorState message="Could not load floor plans." />

  const buildingMap = new Map(buildings.data.results.map((b) => [b.id, b.name]))

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? 'Close' : 'Add floor plan'}
        </button>
      </div>
      {showForm && (
        <FloorPlanForm
          buildings={buildings.data.results}
          onDone={() => setShowForm(false)}
        />
      )}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Building
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Floor
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
            {data.results.map((plan) => (
              <tr key={plan.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {buildingMap.get(plan.building) ?? plan.building}
                </td>
                <td className="px-4 py-3 text-slate-600">{plan.floor_label}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      plan.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {plan.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete floor "${plan.floor_label}"?`))
                        removeMutation.mutate(plan.id)
                    }}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.results.length === 0 && (
          <p className="p-6 text-center text-slate-500">No floor plans yet.</p>
        )}
      </div>
    </div>
  )
}

function FloorPlanForm({
  buildings,
  onDone,
}: {
  buildings: Building[]
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    building: buildings[0]?.id ?? '',
    floor_label: '',
    order: '0',
    is_active: 'true',
  })
  const [file, setFile] = useState<File | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: FormData) => createFloorPlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-floor-plans'] })
      onDone()
    },
  })

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => fd.append(key, value))
    if (file) fd.append('file', file)
    mutation.mutate(fd)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-semibold text-slate-900">Add floor plan</h2>
      {mutation.isError && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not save. Make sure the PDF is valid and the floor label is unique for
          this building.
        </p>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <select
          value={form.building}
          onChange={(e) => update('building', e.target.value)}
          className={inputClass}
        >
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <input
          required
          placeholder="Floor label (e.g. Ground Floor)"
          value={form.floor_label}
          onChange={(e) => update('floor_label', e.target.value)}
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
            checked={form.is_active === 'true'}
            onChange={(e) => update('is_active', String(e.target.checked))}
            className="h-4 w-4 accent-brand-600"
          />
          Visible to students
        </label>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Floor plan PDF
          </label>
          <input
            required
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={`${inputClass} w-full`}
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Add floor plan
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
