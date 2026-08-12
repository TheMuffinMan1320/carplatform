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
import { PRICING_TIER_GRADIENT, PRICING_TIER_LABEL, VEHICLE_STATUS_LABEL, VEHICLE_STATUS_TONE } from '../../lib/enumLabels'
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
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    )
  }

  if (isError || !vehicle) {
    return <ErrorBanner error={error} />
  }

  const handleBookClick = () => {
    if (!user) {
      navigate(`/login?redirect=/vehicles/${vehicle.id}`)
      return
    }
    setShowBooking(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/vehicles" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back to browse
      </Link>

      <Card className="overflow-hidden">
        <div className={`flex h-56 items-center justify-center bg-gradient-to-br p-6 ${PRICING_TIER_GRADIENT[vehicle.pricingTier]}`}>
          <span className="text-center text-3xl font-bold text-white drop-shadow">
            {vehicle.make} {vehicle.model}
          </span>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={VEHICLE_STATUS_TONE[vehicle.status]}>{VEHICLE_STATUS_LABEL[vehicle.status]}</Badge>
            <Badge tone="purple">{PRICING_TIER_LABEL[vehicle.pricingTier]}</Badge>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Year</dt>
              <dd className="font-medium text-slate-900">{vehicle.year}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Mileage</dt>
              <dd className="font-medium text-slate-900">{vehicle.mileage.toLocaleString()} mi</dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="font-medium text-slate-900">{location?.name ?? '—'}</dd>
            </div>
            {vehicle.licensePlate && (
              <div>
                <dt className="text-slate-500">License Plate</dt>
                <dd className="font-medium text-slate-900">{vehicle.licensePlate}</dd>
              </div>
            )}
            <div>
              <dt className="text-slate-500">VIN</dt>
              <dd className="font-medium text-slate-900">{vehicle.vin}</dd>
            </div>
          </dl>
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-2xl font-bold text-slate-900">${vehicle.dailyRate}/day</span>
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
