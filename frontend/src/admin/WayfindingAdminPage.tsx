import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ErrorState, Spinner } from '../components/Feedback'
import {
  createLocation,
  deleteLocation,
  fetchBuildingsAdmin,
  fetchLocationsAdmin,
  updateLocation,
} from '../lib/adminServices'
import type { RoomLocation } from '../lib/types'

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

const categories = [
  'classroom',
  'lab',
  'office',
  'service',
  'entrance',
  'restroom',
  'other',
]

export default function WayfindingAdminPage() {
  const queryClient = useQueryClient()
  const buildings = useQuery({
    queryKey: ['admin-buildings'],
    queryFn: fetchBuildingsAdmin,
  })
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: fetchLocationsAdmin,
  })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RoomLocation | null>(null)

  const removeMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-locations'] }),
  })

  if (isLoading || buildings.isLoading) return <Spinner />
  if (isError || !data || buildings.isError || !buildings.data)
    return <ErrorState message="Could not load locations." />

  const buildingMap = new Map(buildings.data.results.map((b) => [b.id, b.name]))

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">Wayfinding</h1>
      <p className="mt-1 text-slate-500">Manage building locations and rooms.</p>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            setEditing(null)
            setShowForm((v) => !v)
          }}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm && !editing ? 'Close' : 'Add location'}
        </button>
      </div>
      {(showForm || editing) && (
        <LocationForm
          buildings={buildings.data.results.map((b) => ({ id: b.id, name: b.name }))}
          location={editing}
          onDone={() => setShowForm(false)}
        />
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Building
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Category
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
            {data.results.map((loc) => (
              <tr key={loc.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{loc.name}</p>
                  <p className="text-xs text-slate-400">{loc.code || ''}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {buildingMap.get(loc.building) ?? loc.building}
                </td>
                <td className="px-4 py-3 capitalize text-slate-600">{loc.category}</td>
                <td className="px-4 py-3 text-slate-600">{loc.floor || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      loc.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {loc.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      onClick={() => {
                        setEditing(loc)
                        setShowForm(true)
                      }}
                      className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${loc.name}"?`))
                          removeMutation.mutate(loc.id)
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
          <p className="p-6 text-center text-slate-500">No locations yet.</p>
        )}
      </div>
    </div>
  )
}

function LocationForm({
  buildings,
  location,
  onDone,
}: {
  buildings: { id: string; name: string }[]
  location: RoomLocation | null
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    building: location?.building ?? buildings[0]?.id ?? '',
    name: location?.name ?? '',
    code: location?.code ?? '',
    category: location?.category ?? 'classroom',
    floor: location?.floor ?? '',
    description: location?.description ?? '',
    is_active: location?.is_active ?? true,
  })

  const mutation = useMutation({
    mutationFn: (payload: typeof form) =>
      location ? updateLocation(location.id, payload) : createLocation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] })
      onDone()
    },
  })

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="font-semibold text-slate-900">
        {location ? 'Edit location' : 'Add location'}
      </h2>
      {mutation.isError && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not save.
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
          placeholder="Name (e.g. Room 101)"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Code"
          value={form.code}
          onChange={(e) => update('code', e.target.value)}
          className={inputClass}
        />
        <select
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
          className={inputClass}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          placeholder="Floor (e.g. 2)"
          value={form.floor}
          onChange={(e) => update('floor', e.target.value)}
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
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {location ? 'Save changes' : 'Add location'}
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
