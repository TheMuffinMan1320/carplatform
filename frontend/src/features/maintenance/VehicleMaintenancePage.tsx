import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useVehicleQuery } from '../../hooks/useVehicles'
import { useMaintenanceRecords } from '../../hooks/useMaintenance'
import { Button } from '../../components/ui/Button'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { DataTable, type Column } from '../../components/data/DataTable'
import { SERVICE_TYPE_LABEL } from '../../lib/enumLabels'
import { MaintenanceRecordFormModal } from './MaintenanceRecordFormModal'
import type { MaintenanceRecordResponse } from '../../types/maintenance'

export function VehicleMaintenancePage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const [showForm, setShowForm] = useState(false)
  const { data: vehicle } = useVehicleQuery(vehicleId)
  const { data: records, isLoading, isError, error } = useMaintenanceRecords(vehicleId)

  const columns: Column<MaintenanceRecordResponse>[] = [
    { header: 'Service', render: (r) => SERVICE_TYPE_LABEL[r.serviceType] },
    { header: 'Performed', render: (r) => <span className="font-mono">{r.performedAt}</span> },
    { header: 'Mileage', render: (r) => <span className="font-mono">{r.mileageAtService.toLocaleString()}</span> },
    { header: 'Cost', render: (r) => <span className="font-mono">{r.cost ? `$${r.cost}` : '—'}</span> },
    { header: 'Notes', render: (r) => r.notes ?? '—' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link to="/fleet/vehicles" className="inline-flex w-fit items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint hover:text-ink">
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M7 2 L3 6 L7 10" />
        </svg>
        Back to fleet vehicles
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {vehicle ? `${vehicle.make} ${vehicle.model} — Maintenance` : 'Maintenance'}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Service history for this vehicle.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add Record</Button>
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorBanner error={error} />}
      {!isLoading && !isError && records && records.length === 0 && (
        <EmptyState title="No maintenance records yet" message="Log a service to start this vehicle's history." />
      )}
      {!isLoading && !isError && records && records.length > 0 && (
        <DataTable columns={columns} rows={records} rowKey={(r) => r.id} />
      )}

      {showForm && vehicleId && <MaintenanceRecordFormModal vehicleId={vehicleId} onClose={() => setShowForm(false)} />}
    </div>
  )
}
