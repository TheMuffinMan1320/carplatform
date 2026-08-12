import { useState } from 'react'
import { useVehiclesQuery } from '../../hooks/useVehicles'
import { useLocationsMap, useLocationsQuery } from '../../hooks/useLocations'
import { VehicleCard } from './VehicleCard'
import { Select } from '../../components/ui/Input'
import { SkeletonGrid } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { Pagination } from '../../components/data/Pagination'
import { VehicleBlueprint } from '../../components/brand/VehicleBlueprint'
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
    <div className="flex flex-col">
      <section className="relative -mx-4 -mt-8 overflow-hidden border-b border-blueprint-deep bg-blueprint px-4 py-10 sm:-mx-6 sm:px-6 sm:py-16">
        <div className="drafting-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div className="flex flex-col gap-5">
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.01em] text-white sm:text-5xl">
                Every vehicle,
                <br />
                measured before you move.
              </h1>
              <p className="max-w-md text-[15px] leading-relaxed text-blueprint-line/85">
                MyDrive lists the fleet the way an engineer would — real dimensions, real
                mileage, and availability checked against every other reservation before you
                ever see it.
              </p>
            </div>
            <div className="relative rounded-[3px] border border-blueprint-line-dim/30 bg-blueprint-deep/40 p-6">
              <VehicleBlueprint variant="executive" className="h-36 w-full text-blueprint-line sm:h-44" stroke="currentColor" showDimensions />
              <div className="dim-rule dim-rule--inverse mt-5" />
              <div className="mt-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-blueprint-line-dim">
                <span>Fig. 01 — reference profile</span>
                <span>Scale n.t.s.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-blueprint-line-dim/25 pt-6 sm:grid-cols-3">
            <Select inverse label="Location" value={locationId} onChange={(e) => handleLocationChange(e.target.value)}>
              <option value="">All locations</option>
              {locationsPage?.content.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </Select>
            <Select
              inverse
              label="Status"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as VehicleStatus | '')}
            >
              <option value="">All statuses</option>
              {(Object.keys(VEHICLE_STATUS_LABEL) as VehicleStatus[]).map((s) => (
                <option key={s} value={s}>
                  {VEHICLE_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
            <Select
              inverse
              label="Pricing tier"
              value={pricingTier}
              onChange={(e) => handleTierChange(e.target.value as PricingTier | '')}
            >
              <option value="">All tiers</option>
              {(Object.keys(PRICING_TIER_LABEL) as PricingTier[]).map((t) => (
                <option key={t} value={t}>
                  {PRICING_TIER_LABEL[t]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6 py-8">
        {isLoading && <SkeletonGrid count={PAGE_SIZE} />}
        {isError && <ErrorBanner error={error} />}
        {!isLoading && !isError && data && data.content.length === 0 && (
          <EmptyState title="No vehicles match those filters" message="Try loosening a filter above." />
        )}
        {!isLoading && !isError && data && data.content.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.content.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} locationName={locationsMap.get(vehicle.locationId)} />
              ))}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
