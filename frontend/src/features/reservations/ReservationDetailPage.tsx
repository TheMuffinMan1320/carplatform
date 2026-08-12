import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useReservationQuery, useCancelReservation } from '../../hooks/useReservations'
import { useVehicleQuery } from '../../hooks/useVehicles'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { ErrorBanner } from '../../components/ui/ErrorBanner'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_TONE } from '../../lib/enumLabels'
import { friendlyErrorMessage } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'
import { PaymentPanel } from '../payments/PaymentPanel'

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: reservation, isLoading, isError, error } = useReservationQuery(id)
  const { data: vehicle } = useVehicleQuery(reservation?.vehicleId)
  const cancelReservation = useCancelReservation(id ?? '')
  const [cancelError, setCancelError] = useState<string | null>(null)
  const { showToast } = useToast()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (isError || !reservation) {
    return <ErrorBanner error={error} />
  }

  const handleCancel = async () => {
    setCancelError(null)
    try {
      await cancelReservation.mutateAsync()
      showToast('Reservation cancelled.', 'success')
    } catch (err) {
      setCancelError(friendlyErrorMessage(err))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/my/reservations" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back to my reservations
      </Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Reservation'}
            </h1>
            <p className="text-slate-600">
              {reservation.startDate} → {reservation.endDate}
            </p>
          </div>
          <Badge tone={RESERVATION_STATUS_TONE[reservation.status]}>{RESERVATION_STATUS_LABEL[reservation.status]}</Badge>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-lg font-semibold text-slate-900">Total: ${reservation.totalAmount}</span>
          {reservation.status === 'RESERVED' && (
            <Button variant="danger" onClick={handleCancel} loading={cancelReservation.isPending}>
              Cancel reservation
            </Button>
          )}
        </div>
        {reservation.status === 'ACTIVE' && (
          <p className="mt-2 text-xs text-slate-500">
            This reservation is already active (picked up) and can no longer be self-cancelled.
          </p>
        )}
        {cancelError && <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{cancelError}</div>}
      </Card>

      <PaymentPanel reservationId={reservation.id} />
    </div>
  )
}
