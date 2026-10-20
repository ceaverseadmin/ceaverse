import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminTableSkeleton } from '../../components/AdminSkeletons'
import { ErrorState } from '../../components/Feedback'
import { Modal } from '../../components/Modal'
import PdfViewer from '../../components/PdfViewer'
import { PdfPageSkeleton, Skeleton, SkeletonStatus } from '../../components/Skeleton'
import {
  createFloorPlan,
  deleteFloorPlan,
  fetchBuildingsAdmin,
  fetchFloorPlansAdmin,
  updateFloorPlan,
  type AdminFloorPlan,
} from '../../lib/adminServices'
import type { Building } from '../../lib/types'

const inputClass =
  'rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function FloorPlansSection() {
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
  const [editing, setEditing] = useState<AdminFloorPlan | null>(null)
  const [selected, setSelected] = useState<AdminFloorPlan | null>(null)

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const removeMutation = useMutation({
    mutationFn: deleteFloorPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-floor-plans'] })
      queryClient.invalidateQueries({ queryKey: ['building'] })
    },
  })

  if (isLoading || buildings.isLoading)
    return (
      <div>
        <div className="flex justify-end">
          <Skeleton className="h-9 w-36" />
        </div>
        <SkeletonStatus
          label="Loading floor plans"
          className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start"
        >
          <AdminTableSkeleton columns={4} rows={5} />
          <PdfPageSkeleton className="min-h-40" />
        </SkeletonStatus>
      </div>
    )
  if (isError || !data || buildings.isError || !buildings.data)
    return <ErrorState message="Could not load floor plans." />

  const buildingMap = new Map(buildings.data.results.map((b) => [b.id, b.name]))
  const selectedPlan = selected
    ? (data.results.find((plan) => plan.id === selected.id) ?? null)
    : null

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
          Add floor plan
        </button>
      </div>
      {(showForm || editing) && (
        <Modal
          title={editing ? 'Edit floor plan' : 'Add floor plan'}
          onClose={closeForm}
        >
          <FloorPlanForm
            plan={editing}
            buildings={buildings.data.results}
            onDone={closeForm}
          />
        </Modal>
      )}
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
        <div className="min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Building
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Title
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
                <tr
                  key={plan.id}
                  className={selectedPlan?.id === plan.id ? 'bg-brand-50' : undefined}
                >
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
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected(plan)}
                        aria-pressed={selectedPlan?.id === plan.id}
                        className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          setEditing(plan)
                          setShowForm(true)
                        }}
                        className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete floor "${plan.floor_label}"?`))
                            removeMutation.mutate(plan.id)
                        }}
                        className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
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
            <p className="p-6 text-center text-slate-500">No floor plans yet.</p>
          )}
        </div>

        <div className="min-w-0">
          {selectedPlan ? (
            <>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {selectedPlan.floor_label}
                </p>
                <Link
                  to={`/navigate?building=${selectedPlan.building}&floor=${selectedPlan.id}`}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Open in Navigate
                </Link>
              </div>
              <PdfViewer
                key={selectedPlan.id}
                url={selectedPlan.file}
                title={selectedPlan.floor_label}
              />
            </>
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500">
              Select a floor plan to preview it.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FloorPlanForm({
  plan,
  buildings,
  onDone,
}: {
  plan: AdminFloorPlan | null
  buildings: Building[]
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    building: plan?.building ?? buildings[0]?.id ?? '',
    floor_label: plan?.floor_label ?? '',
    order: plan?.order?.toString() ?? '0',
    is_active: String(plan?.is_active ?? true),
  })
  const [file, setFile] = useState<File | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: FormData) =>
      plan ? updateFloorPlan(plan.id, payload) : createFloorPlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-floor-plans'] })
      queryClient.invalidateQueries({ queryKey: ['building'] })
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
    <form onSubmit={handleSubmit}>
      {mutation.isError && (
        <p className="mb-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700">
          Could not save. Make sure the PDF is valid and the floor label is unique for
          this building.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
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
          placeholder="Plan title (e.g. Ground Floor)"
          value={form.floor_label}
          onChange={(e) => update('floor_label', e.target.value)}
          className={inputClass}
        />
        <div>
          <label
            htmlFor="floor-plan-order"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Display order
          </label>
          <input
            id="floor-plan-order"
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
            checked={form.is_active === 'true'}
            onChange={(e) => update('is_active', String(e.target.checked))}
            className="h-4 w-4 accent-brand-600"
          />
          Visible to students
        </label>
        <div className="sm:col-span-2">
          <label
            htmlFor="floor-plan-file"
            className="block text-sm font-medium text-slate-700"
          >
            Floor plan PDF{plan ? ' (optional)' : ''}
          </label>
          <input
            id="floor-plan-file"
            required={!plan}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={`${inputClass} w-full`}
          />
          {plan && (
            <p className="mt-1 text-xs text-slate-500">
              Leave empty to keep the current PDF.
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {plan ? 'Save changes' : 'Add floor plan'}
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
