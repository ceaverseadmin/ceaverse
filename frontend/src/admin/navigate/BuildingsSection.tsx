import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AdminTableSkeleton } from '../../components/AdminSkeletons'
import { ErrorState } from '../../components/Feedback'
import { Modal } from '../../components/Modal'
import { Skeleton, SkeletonStatus } from '../../components/Skeleton'
import {
  createBuilding,
  deleteBuilding,
  fetchBuildingsAdmin,
  updateBuilding,
} from '../../lib/adminServices'
import type { Building } from '../../lib/types'

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function BuildingsSection() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-buildings'],
    queryFn: fetchBuildingsAdmin,
  })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Building | null>(null)

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const removeMutation = useMutation({
    mutationFn: deleteBuilding,
    onSuccess: () => {
      for (const queryKey of [
        ['admin-buildings'],
        ['admin-floor-plans'],
        ['admin-locations'],
        ['buildings'],
        ['building'],
        ['locations'],
      ]) {
        queryClient.invalidateQueries({ queryKey })
      }
    },
  })

  if (isLoading)
    return (
      <div>
        <div className="flex justify-end">
          <Skeleton className="h-9 w-32" />
        </div>
        <SkeletonStatus label="Loading buildings" className="mt-4">
          <AdminTableSkeleton columns={4} rows={5} />
        </SkeletonStatus>
      </div>
    )
  if (isError || !data) return <ErrorState message="Could not load buildings." />

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Add building
        </button>
      </div>
      {(showForm || editing) && (
        <Modal title={editing ? 'Edit building' : 'Add building'} onClose={closeForm}>
          <BuildingForm building={editing} onDone={closeForm} />
        </Modal>
      )}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
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
                            `Delete "${building.name}" and its floor plans and rooms?`,
                          )
                        )
                          removeMutation.mutate(building.id)
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
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
      queryClient.invalidateQueries({ queryKey: ['building'] })
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
    <form onSubmit={handleSubmit}>
      {mutation.isError && (
        <p className="mb-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          Could not save.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
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
        <div>
          <label
            htmlFor="building-order"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Display order
          </label>
          <input
            id="building-order"
            type="number"
            placeholder="0"
            value={form.order}
            onChange={(e) => update('order', e.target.value)}
            className={`${inputClass} w-full`}
          />
          <p className="mt-1 text-xs text-slate-500">Lower numbers appear first.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:mt-6">
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
