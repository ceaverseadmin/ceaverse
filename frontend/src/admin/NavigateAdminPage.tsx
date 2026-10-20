import { useState } from 'react'
import { BuildingsSection } from './navigate/BuildingsSection'
import { FloorPlansSection } from './navigate/FloorPlansSection'
import { RoomsSection } from './navigate/RoomsSection'

const tabs = [
  { value: 'buildings', label: 'Buildings' },
  { value: 'floor-plans', label: 'Floor plans' },
  { value: 'rooms', label: 'Rooms' },
] as const

type Tab = (typeof tabs)[number]['value']

export default function NavigateAdminPage() {
  const [tab, setTab] = useState<Tab>('buildings')

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Navigate</h1>
      <p className="mt-1 text-slate-500">
        Manage campus buildings, their floor plan PDFs, and searchable rooms.
      </p>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            aria-pressed={tab === item.value}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === item.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'buildings' && <BuildingsSection />}
        {tab === 'floor-plans' && <FloorPlansSection />}
        {tab === 'rooms' && <RoomsSection />}
      </div>
    </div>
  )
}
