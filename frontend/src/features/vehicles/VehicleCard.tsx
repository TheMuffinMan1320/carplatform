import { Link } from 'react-router-dom'
import type { VehicleResponse } from '../../types/vehicle'
import { Badge } from '../../components/ui/Badge'
import { PRICING_TIER_GRADIENT, PRICING_TIER_LABEL, VEHICLE_STATUS_LABEL, VEHICLE_STATUS_TONE } from '../../lib/enumLabels'

export function VehicleCard({ vehicle, locationName }: { vehicle: VehicleResponse; locationName?: string }) {
  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className={`relative flex h-32 items-center justify-center bg-gradient-to-br p-4 ${PRICING_TIER_GRADIENT[vehicle.pricingTier]}`}
      >
        <span className="text-center text-xl font-bold leading-tight text-white drop-shadow">
          {vehicle.make} {vehicle.model}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-800">
          {PRICING_TIER_LABEL[vehicle.pricingTier]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{vehicle.year}</span>
          <Badge tone={VEHICLE_STATUS_TONE[vehicle.status]}>{VEHICLE_STATUS_LABEL[vehicle.status]}</Badge>
        </div>
        {locationName && <span className="text-sm text-slate-600">{locationName}</span>}
        <span className="mt-auto text-lg font-semibold text-slate-900">${vehicle.dailyRate}/day</span>
      </div>
    </Link>
  )
}
