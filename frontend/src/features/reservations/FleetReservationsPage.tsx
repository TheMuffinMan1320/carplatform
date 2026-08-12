import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReservationsQuery } from '../../hooks/useReservations'
import { useVehiclesMap } from '../../hooks/useVehicles'
import { Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { DataTable, type Column } from '../../components/data/DataTable'
import { Pagination } from '../../components/data/Pagination'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_TONE } from '../../lib/enumLabels'
import { ReservationRowActions } from './ReservationRowActions'
import type { ReservationResponse, ReservationStatus } from '../../types/reservation'

const PAGE_SIZE = 10

export function FleetReservationsPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<ReservationStatus | ''>('')
  const { map: vehiclesMap } = useVehiclesMap()

  const { data, isLoading, isError, error } = useReservationsQuery({
    page,
    size: PAGE_SIZE,
    sort: 'startDate,desc',
    status: status || undefined,
  })

  const columns: Column<ReservationResponse>[] = [
    {
      header: 'Vehicle',
      render: (r) => (
        <Link to={`/fleet/vehicles`} className="text-ink hover:text-signal hover:underline">
          {vehiclesMap.get(r.vehicleId) ?? r.vehicleId}
        </Link>
      ),
    },
    { header: 'Dates', render: (r) => <span className="font-mono text-[13px]">{r.startDate} → {r.endDate}</span> },
    { header: 'Total', render: (r) => <span className="font-mono">${r.totalAmount}</span> },
    { header: 'Status', render: (r) => <Badge tone={RESERVATION_STATUS_TONE[r.status]}>{RESERVATION_STATUS_LABEL[r.status]}</Badge> },
    { header: 'Actions', render: (r) => <ReservationRowActions reservation={r} /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Reservations</h1>
          <p className="mt-1 text-sm text-ink-soft">Activate pickups, complete returns, and manage cancellations.</p>
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ReservationStatus | '')
            setPage(0)
          }}
          className="min-w-[10rem]"
        >
          <option value="">All statuses</option>
          {(Object.keys(RESERVATION_STATUS_LABEL) as ReservationStatus[]).map((s) => (
            <option key={s} value={s}>
              {RESERVATION_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorBanner error={error} />}
      {!isLoading && !isError && data && data.content.length === 0 && (
        <EmptyState title="No reservations" message="No reservations match this filter." />
      )}
      {!isLoading && !isError && data && data.content.length > 0 && (
        <>
          <DataTable columns={columns} rows={data.content} rowKey={(r) => r.id} />
          <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
