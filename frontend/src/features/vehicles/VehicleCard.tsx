import { Link } from 'react-router-dom'
import type { VehicleResponse } from '../../types/vehicle'
import { Badge } from '../../components/ui/Badge'
import { VehicleBlueprint } from '../../components/brand/VehicleBlueprint'
import {
  PRICING_TIER_ACCENT,
  PRICING_TIER_LABEL,
  PRICING_TIER_SILHOUETTE,
  VEHICLE_STATUS_LABEL,
  VEHICLE_STATUS_TONE,
} from '../../lib/enumLabels'

export function VehicleCard({ vehicle, locationName }: { vehicle: VehicleResponse; locationName?: string }) {
  const accent = PRICING_TIER_ACCENT[vehicle.pricingTier]
  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group flex flex-col overflow-hidden rounded-[3px] border border-ink/12 bg-white shadow-[0_1px_2px_rgba(22,33,44,0.04),0_4px_10px_-4px_rgba(22,33,44,0.08)] transition-shadow hover:shadow-[0_4px_16px_-4px_rgba(22,33,44,0.18)]"
    >
      <div className="drafting-grid--light relative flex h-32 items-center justify-center border-b border-ink/10 bg-vellum px-6">
        <span
          className="absolute right-3 top-3 rounded-[3px] border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em]"
          style={{ borderColor: `${accent}55`, color: accent, backgroundColor: `${accent}14` }}
        >
          {PRICING_TIER_LABEL[vehicle.pricingTier]}
        </span>
        <VehicleBlueprint
          variant={PRICING_TIER_SILHOUETTE[vehicle.pricingTier]}
          className="h-full w-full transition-transform group-hover:scale-[1.03]"
          stroke={accent}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-display text-base font-semibold leading-tight text-ink">
              {vehicle.make} {vehicle.model}
            </span>
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
              {vehicle.year} {locationName && `· ${locationName}`}
            </div>
          </div>
          <Badge tone={VEHICLE_STATUS_TONE[vehicle.status]}>{VEHICLE_STATUS_LABEL[vehicle.status]}</Badge>
        </div>
        <div className="dim-rule" />
        <div className="mt-auto flex items-end justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
            {vehicle.mileage.toLocaleString()} mi
          </span>
          <span className="font-display text-lg font-semibold text-ink">
            ${vehicle.dailyRate}
            <span className="font-mono text-[11px] font-normal uppercase tracking-[0.06em] text-ink-faint">/day</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
