import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useVehicleAvailability } from '../../hooks/useVehicles'
import { useCreateReservation } from '../../hooks/useReservations'
import { friendlyErrorMessage } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'
import type { VehicleResponse } from '../../types/vehicle'

interface BookVehicleFlowProps {
  vehicle: VehicleResponse
  onClose: () => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function BookVehicleFlow({ vehicle, onClose }: BookVehicleFlowProps) {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState(todayIso())
  const [endDate, setEndDate] = useState(todayIso())
  const [error, setError] = useState<string | null>(null)

  const validRange = startDate && endDate && startDate <= endDate
  const { data: availability, isFetching: checkingAvailability } = useVehicleAvailability(
    validRange ? vehicle.id : undefined,
    startDate,
    endDate,
  )
  const createReservation = useCreateReservation()
  const { showToast } = useToast()

  const nights = validRange
    ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1)
    : 0
  const estimatedTotal = nights * Number(vehicle.dailyRate)

  const handleSubmit = async () => {
    setError(null)
    try {
      const reservation = await createReservation.mutateAsync({ vehicleId: vehicle.id, startDate, endDate })
      showToast('Booking confirmed.', 'success')
      onClose()
      navigate(`/my/reservations/${reservation.id}`)
    } catch (err) {
      setError(friendlyErrorMessage(err))
    }
  }

  return (
    <Modal title={`Book ${vehicle.make} ${vehicle.model}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {error && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start date"
            type="date"
            min={todayIso()}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End date"
            type="date"
            min={startDate || todayIso()}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {!validRange && <p className="text-sm text-rose-600">End date must be on or after the start date.</p>}

        {validRange && (
          <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
            <span>
              {nights} night{nights === 1 ? '' : 's'} · ${vehicle.dailyRate}/day
            </span>
            <span className="font-semibold">Est. total: ${estimatedTotal.toFixed(2)}</span>
          </div>
        )}

        {validRange && checkingAvailability && <p className="text-sm text-slate-500">Checking availability…</p>}
        {validRange && !checkingAvailability && availability && (
          <p className={`text-sm font-medium ${availability.available ? 'text-emerald-600' : 'text-rose-600'}`}>
            {availability.available ? 'Available for these dates' : 'Not available for these dates'}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={createReservation.isPending}
            disabled={!validRange || !availability?.available}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </Modal>
  )
}
