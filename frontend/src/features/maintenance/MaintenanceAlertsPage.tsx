import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDismissMaintenanceAlert, useMaintenanceAlerts } from '../../hooks/useMaintenance'
import { useVehiclesMap } from '../../hooks/useVehicles'
import { useLocationsQuery } from '../../hooks/useLocations'
import { Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { DataTable, type Column } from '../../components/data/DataTable'
import { Pagination } from '../../components/data/Pagination'
import { ALERT_STATUS_LABEL, ALERT_STATUS_TONE, SERVICE_TYPE_LABEL } from '../../lib/enumLabels'
import { friendlyErrorMessage } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'
import type { AlertStatus, MaintenanceAlertResponse } from '../../types/maintenance'

const PAGE_SIZE = 10

function DismissButton({ alertId }: { alertId: string }) {
  const dismiss = useDismissMaintenanceAlert()
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()
  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="secondary"
        className="!px-2 !py-1 text-xs"
        loading={dismiss.isPending}
        onClick={async () => {
          setError(null)
          try {
            await dismiss.mutateAsync(alertId)
            showToast('Alert dismissed.', 'success')
          } catch (err) {
            setError(friendlyErrorMessage(err))
          }
        }}
      >
        Dismiss
      </Button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  )
}

export function MaintenanceAlertsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<AlertStatus | ''>('OPEN')
  const [locationId, setLocationId] = useState('')

  const { data: locationsPage } = useLocationsQuery({ size: 50 })
  const { map: vehiclesMap } = useVehiclesMap()

  const { data, isLoading, isError, error } = useMaintenanceAlerts({
    page,
    size: PAGE_SIZE,
    status: status || undefined,
    locationId: (isAdmin ? locationId : undefined) || undefined,
  })

  const columns: Column<MaintenanceAlertResponse>[] = [
    { header: 'Vehicle', render: (a) => vehiclesMap.get(a.vehicleId) ?? a.vehicleId },
    { header: 'Service', render: (a) => SERVICE_TYPE_LABEL[a.serviceType] },
    { header: 'Due mileage', render: (a) => (a.dueMileage != null ? a.dueMileage.toLocaleString() : '—') },
    { header: 'Due date', render: (a) => a.dueDate ?? '—' },
    { header: 'Status', render: (a) => <Badge tone={ALERT_STATUS_TONE[a.status]}>{ALERT_STATUS_LABEL[a.status]}</Badge> },
    { header: '', render: (a) => (a.status === 'OPEN' ? <DismissButton alertId={a.id} /> : null) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Maintenance Alerts</h1>
        <p className="text-slate-600">Vehicles due for service based on mileage or time interval rules.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as AlertStatus | '')
            setPage(0)
          }}
          className="min-w-[10rem]"
        >
          <option value="">All statuses</option>
          {(Object.keys(ALERT_STATUS_LABEL) as AlertStatus[]).map((s) => (
            <option key={s} value={s}>
              {ALERT_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        {isAdmin && (
          <Select
            value={locationId}
            onChange={(e) => {
              setLocationId(e.target.value)
              setPage(0)
            }}
            className="min-w-[10rem]"
          >
            <option value="">All locations</option>
            {locationsPage?.content.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorBanner error={error} />}
      {!isLoading && !isError && data && data.content.length === 0 && (
        <EmptyState title="No alerts" message="No maintenance alerts match this filter." />
      )}
      {!isLoading && !isError && data && data.content.length > 0 && (
        <>
          <DataTable columns={columns} rows={data.content} rowKey={(a) => a.id} />
          <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
