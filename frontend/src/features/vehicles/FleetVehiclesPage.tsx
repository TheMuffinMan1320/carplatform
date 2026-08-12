import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useVehiclesQuery } from '../../hooks/useVehicles'
import { useLocationsMap, useLocationsQuery } from '../../hooks/useLocations'
import { Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { DataTable, type Column } from '../../components/data/DataTable'
import { Pagination } from '../../components/data/Pagination'
import { PRICING_TIER_LABEL, VEHICLE_STATUS_LABEL, VEHICLE_STATUS_TONE } from '../../lib/enumLabels'
import { VehicleFormModal } from './VehicleFormModal'
import { VehicleRowActions } from './VehicleRowActions'
import type { PricingTier, VehicleResponse, VehicleStatus } from '../../types/vehicle'

const PAGE_SIZE = 10

export function FleetVehiclesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [page, setPage] = useState(0)
  const [locationId, setLocationId] = useState(isAdmin ? '' : (user?.locationId ?? ''))
  const [status, setStatus] = useState<VehicleStatus | ''>('')
  const [pricingTier, setPricingTier] = useState<PricingTier | ''>('')
  const [modalVehicle, setModalVehicle] = useState<VehicleResponse | 'new' | null>(null)

  const { data: locationsPage } = useLocationsQuery({ size: 50 })
  const { map: locationsMap } = useLocationsMap()

  const { data, isLoading, isError, error } = useVehiclesQuery({
    page,
    size: PAGE_SIZE,
    sort: 'make,asc',
    locationId: locationId || undefined,
    status: status || undefined,
    pricingTier: pricingTier || undefined,
  })

  const canManage = (vehicle: VehicleResponse) => isAdmin || vehicle.locationId === user?.locationId

  const columns: Column<VehicleResponse>[] = [
    { header: 'Vehicle', render: (v) => `${v.make} ${v.model} (${v.year})` },
    { header: 'Location', render: (v) => locationsMap.get(v.locationId) ?? '—' },
    { header: 'Tier', render: (v) => PRICING_TIER_LABEL[v.pricingTier] },
    { header: 'Daily Rate', render: (v) => `$${v.dailyRate}` },
    { header: 'Mileage', render: (v) => v.mileage.toLocaleString() },
    { header: 'Status', render: (v) => <Badge tone={VEHICLE_STATUS_TONE[v.status]}>{VEHICLE_STATUS_LABEL[v.status]}</Badge> },
    {
      header: 'Actions',
      render: (v) => (
        <VehicleRowActions vehicle={v} canManage={canManage(v)} canDelete={isAdmin} onEdit={() => setModalVehicle(v)} />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fleet Vehicles</h1>
          <p className="text-slate-600">
            {isAdmin ? 'Manage vehicles across all locations.' : 'Manage vehicles at your location.'}
          </p>
        </div>
        <Button onClick={() => setModalVehicle('new')}>+ Add Vehicle</Button>
      </div>

      <div className="flex flex-wrap gap-3">
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
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as VehicleStatus | '')
            setPage(0)
          }}
          className="min-w-[10rem]"
        >
          <option value="">All statuses</option>
          {(Object.keys(VEHICLE_STATUS_LABEL) as VehicleStatus[]).map((s) => (
            <option key={s} value={s}>
              {VEHICLE_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Select
          value={pricingTier}
          onChange={(e) => {
            setPricingTier(e.target.value as PricingTier | '')
            setPage(0)
          }}
          className="min-w-[10rem]"
        >
          <option value="">All tiers</option>
          {(Object.keys(PRICING_TIER_LABEL) as PricingTier[]).map((t) => (
            <option key={t} value={t}>
              {PRICING_TIER_LABEL[t]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && <SkeletonRows />}
      {isError && <ErrorBanner error={error} />}
      {!isLoading && !isError && data && data.content.length === 0 && (
        <EmptyState title="No vehicles found" message="Try adjusting the filters above, or add a new vehicle." />
      )}
      {!isLoading && !isError && data && data.content.length > 0 && (
        <>
          <DataTable columns={columns} rows={data.content} rowKey={(v) => v.id} />
          <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
        </>
      )}

      {modalVehicle && (
        <VehicleFormModal
          vehicle={modalVehicle === 'new' ? undefined : modalVehicle}
          defaultLocationId={isAdmin ? undefined : (user?.locationId ?? undefined)}
          lockLocation={!isAdmin}
          onClose={() => setModalVehicle(null)}
        />
      )}
    </div>
  )
}
