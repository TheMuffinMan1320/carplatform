import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useCompleteReservation } from '../../hooks/useReservations'
import { friendlyErrorMessage } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'

export function CompleteReservationModal({ reservationId, onClose }: { reservationId: string; onClose: () => void }) {
  const [endMileage, setEndMileage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const completeReservation = useCompleteReservation(reservationId)
  const { showToast } = useToast()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const mileage = Number(endMileage)
    if (Number.isNaN(mileage) || mileage < 0) {
      setError('End mileage must be 0 or more.')
      return
    }
    try {
      await completeReservation.mutateAsync({ endMileage: mileage })
      showToast('Reservation completed.', 'success')
      onClose()
    } catch (err) {
      setError(friendlyErrorMessage(err))
    }
  }

  return (
    <Modal title="Complete Reservation" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <Input
          label="Ending mileage"
          type="number"
          required
          value={endMileage}
          onChange={(e) => setEndMileage(e.target.value)}
          hint="The vehicle's odometer reading at return"
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={completeReservation.isPending}>
            Complete
          </Button>
        </div>
      </form>
    </Modal>
  )
}
