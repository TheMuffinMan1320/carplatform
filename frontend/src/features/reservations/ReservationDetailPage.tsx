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
      <Link to="/my/reservations" className="inline-flex w-fit items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint hover:text-ink">
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M7 2 L3 6 L7 10" />
        </svg>
        Back to my reservations
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">
              {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Reservation'}
            </h1>
            <p className="mt-0.5 font-mono text-[12px] text-ink-soft">
              {reservation.startDate} → {reservation.endDate}
            </p>
          </div>
          <Badge tone={RESERVATION_STATUS_TONE[reservation.status]}>{RESERVATION_STATUS_LABEL[reservation.status]}</Badge>
        </div>

        <div className="dim-rule my-4" />

        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-ink">
            Total: ${reservation.totalAmount}
          </span>
          {reservation.status === 'RESERVED' && (
            <Button variant="danger" onClick={handleCancel} loading={cancelReservation.isPending}>
              Cancel reservation
            </Button>
          )}
        </div>
        {reservation.status === 'ACTIVE' && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.05em] text-ink-faint">
            This reservation is already active (picked up) and can no longer be self-cancelled.
          </p>
        )}
        {cancelError && (
          <div className="mt-3 rounded-[3px] border border-[#b3402c]/30 bg-[#fbe7e2] px-3 py-2 text-sm text-[#8f3222]">{cancelError}</div>
        )}
      </Card>

      <PaymentPanel reservationId={reservation.id} />
    </div>
  )
}
