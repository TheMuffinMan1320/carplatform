import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useVehicleQuery } from '../../hooks/useVehicles'
import { useLocationQuery } from '../../hooks/useLocations'
import { useAuth } from '../../context/AuthContext'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { VehicleBlueprint } from '../../components/brand/VehicleBlueprint'
import {
  PRICING_TIER_ACCENT,
  PRICING_TIER_LABEL,
  PRICING_TIER_SILHOUETTE,
  VEHICLE_STATUS_LABEL,
  VEHICLE_STATUS_TONE,
} from '../../lib/enumLabels'
import { BookVehicleFlow } from '../reservations/BookVehicleFlow'

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showBooking, setShowBooking] = useState(false)

  const { data: vehicle, isLoading, isError, error } = useVehicleQuery(id)
  const { data: location } = useLocationQuery(vehicle?.locationId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    )
  }

  if (isError || !vehicle) {
    return <ErrorBanner error={error} />
  }

  const accent = PRICING_TIER_ACCENT[vehicle.pricingTier]

  const handleBookClick = () => {
    if (!user) {
      navigate(`/login?redirect=/vehicles/${vehicle.id}`)
      return
    }
    setShowBooking(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/vehicles" className="inline-flex w-fit items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint hover:text-ink">
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M7 2 L3 6 L7 10" />
        </svg>
        Back to browse
      </Link>

      <Card className="overflow-hidden">
        <div className="drafting-grid--light relative flex h-56 items-center justify-between gap-4 border-b border-ink/10 bg-vellum px-6 sm:h-64 sm:px-10">
          <div className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint sm:block">
            Fig. 01
            <br />
            Side profile
          </div>
          <VehicleBlueprint
            variant={PRICING_TIER_SILHOUETTE[vehicle.pricingTier]}
            className="h-full max-w-xl flex-1"
            stroke={accent}
            showDimensions
          />
          <div className="hidden shrink-0 text-right font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint sm:block">
            {vehicle.vin.slice(-6)}
            <br />
            Scale n.t.s.
          </div>
        </div>
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">{vehicle.year} model year</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={VEHICLE_STATUS_TONE[vehicle.status]}>{VEHICLE_STATUS_LABEL[vehicle.status]}</Badge>
              <span
                className="inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em]"
                style={{ borderColor: `${accent}55`, color: accent, backgroundColor: `${accent}14` }}
              >
                {PRICING_TIER_LABEL[vehicle.pricingTier]}
              </span>
            </div>
          </div>

          <div className="dim-rule" />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">Mileage</dt>
              <dd className="mt-0.5 font-display font-medium text-ink">{vehicle.mileage.toLocaleString()} mi</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">Location</dt>
              <dd className="mt-0.5 font-display font-medium text-ink">{location?.name ?? '—'}</dd>
            </div>
            {vehicle.licensePlate && (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">Plate</dt>
                <dd className="mt-0.5 font-display font-medium text-ink">{vehicle.licensePlate}</dd>
              </div>
            )}
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">VIN</dt>
              <dd className="mt-0.5 font-mono font-medium text-ink">{vehicle.vin}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-5">
            <span className="font-display text-2xl font-semibold text-ink">
              ${vehicle.dailyRate}
              <span className="font-mono text-xs font-normal uppercase tracking-[0.06em] text-ink-faint"> / day</span>
            </span>
            <Button onClick={handleBookClick} disabled={vehicle.status !== 'AVAILABLE'}>
              {vehicle.status === 'AVAILABLE' ? 'Book this vehicle' : 'Not bookable right now'}
            </Button>
          </div>
        </div>
      </Card>

      {showBooking && <BookVehicleFlow vehicle={vehicle} onClose={() => setShowBooking(false)} />}
    </div>
  )
}
