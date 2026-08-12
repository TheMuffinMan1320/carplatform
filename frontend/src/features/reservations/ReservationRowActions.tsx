import { useState } from 'react'
import { useActivateReservation, useCancelReservation } from '../../hooks/useReservations'
import { Button } from '../../components/ui/Button'
import { friendlyErrorMessage } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'
import { CompleteReservationModal } from './CompleteReservationModal'
import type { ReservationResponse } from '../../types/reservation'

export function ReservationRowActions({ reservation }: { reservation: ReservationResponse }) {
  const activate = useActivateReservation(reservation.id)
  const cancel = useCancelReservation(reservation.id)
  const [showComplete, setShowComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  const handleActivate = async () => {
    setError(null)
    try {
      await activate.mutateAsync()
      showToast('Reservation activated.', 'success')
    } catch (err) {
      setError(friendlyErrorMessage(err))
    }
  }

  const handleCancel = async () => {
    setError(null)
    try {
      await cancel.mutateAsync()
      showToast('Reservation cancelled.', 'success')
    } catch (err) {
      setError(friendlyErrorMessage(err))
    }
  }

  if (reservation.status !== 'RESERVED' && reservation.status !== 'ACTIVE') {
    return <span className="text-xs text-slate-400">—</span>
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        {reservation.status === 'RESERVED' && (
          <Button className="!px-2 !py-1 text-xs" loading={activate.isPending} onClick={handleActivate}>
            Activate
          </Button>
        )}
        {reservation.status === 'ACTIVE' && (
          <Button className="!px-2 !py-1 text-xs" onClick={() => setShowComplete(true)}>
            Complete
          </Button>
        )}
        <Button variant="danger" className="!px-2 !py-1 text-xs" loading={cancel.isPending} onClick={handleCancel}>
          Cancel
        </Button>
      </div>
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {showComplete && <CompleteReservationModal reservationId={reservation.id} onClose={() => setShowComplete(false)} />}
    </div>
  )
}
