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
    { header: 'Performed', render: (r) => r.performedAt },
    { header: 'Mileage', render: (r) => r.mileageAtService.toLocaleString() },
    { header: 'Cost', render: (r) => (r.cost ? `$${r.cost}` : '—') },
    { header: 'Notes', render: (r) => r.notes ?? '—' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link to="/fleet/vehicles" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back to fleet vehicles
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {vehicle ? `${vehicle.make} ${vehicle.model} — Maintenance` : 'Maintenance'}
          </h1>
          <p className="text-slate-600">Service history for this vehicle.</p>
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
