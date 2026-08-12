import { useState } from 'react'
import { useVehiclesQuery } from '../../hooks/useVehicles'
import { useLocationsMap, useLocationsQuery } from '../../hooks/useLocations'
import { VehicleCard } from './VehicleCard'
import { Select } from '../../components/ui/Input'
import { SkeletonGrid } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { Pagination } from '../../components/data/Pagination'
import { PRICING_TIER_LABEL, VEHICLE_STATUS_LABEL } from '../../lib/enumLabels'
import type { PricingTier, VehicleStatus } from '../../types/vehicle'

const PAGE_SIZE = 9

export function VehicleBrowsePage() {
  const [page, setPage] = useState(0)
  const [locationId, setLocationId] = useState('')
  const [status, setStatus] = useState<VehicleStatus | ''>('')
  const [pricingTier, setPricingTier] = useState<PricingTier | ''>('')

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

  const handleLocationChange = (value: string) => {
    setLocationId(value)
    setPage(0)
  }
  const handleStatusChange = (value: VehicleStatus | '') => {
    setStatus(value)
    setPage(0)
  }
  const handleTierChange = (value: PricingTier | '') => {
    setPricingTier(value)
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Vehicles</h1>
        <p className="text-slate-600">Filter by location, status, or pricing tier across the fleet.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={locationId} onChange={(e) => handleLocationChange(e.target.value)} className="min-w-[10rem]">
          <option value="">All locations</option>
          {locationsPage?.content.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as VehicleStatus | '')}
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
          onChange={(e) => handleTierChange(e.target.value as PricingTier | '')}
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

      {isLoading && <SkeletonGrid count={PAGE_SIZE} />}
      {isError && <ErrorBanner error={error} />}
      {!isLoading && !isError && data && data.content.length === 0 && (
        <EmptyState title="No vehicles match those filters" message="Try loosening a filter above." />
      )}
      {!isLoading && !isError && data && data.content.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} locationName={locationsMap.get(vehicle.locationId)} />
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
