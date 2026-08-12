import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUpdateVehicleStatus, useDeleteVehicle } from '../../hooks/useVehicles'
import { Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { VEHICLE_STATUS_LABEL } from '../../lib/enumLabels'
import { friendlyErrorMessage } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'
import type { VehicleResponse, VehicleStatus } from '../../types/vehicle'

interface VehicleRowActionsProps {
  vehicle: VehicleResponse
  canManage: boolean
  canDelete: boolean
  onEdit: () => void
}

export function VehicleRowActions({ vehicle, canManage, canDelete, onEdit }: VehicleRowActionsProps) {
  const updateStatus = useUpdateVehicleStatus(vehicle.id)
  const deleteVehicle = useDeleteVehicle()
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  if (!canManage) {
    return <span className="text-xs text-slate-400">Different location</span>
  }

  const handleStatusChange = async (status: VehicleStatus) => {
    setError(null)
    try {
      await updateStatus.mutateAsync({ status })
    } catch (err) {
      setError(friendlyErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Retire ${vehicle.make} ${vehicle.model}? This sets its status to RETIRED.`)) return
    setError(null)
    try {
      await deleteVehicle.mutateAsync(vehicle.id)
      showToast('Vehicle retired.', 'success')
    } catch (err) {
      setError(friendlyErrorMessage(err))
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="text-sm font-medium text-slate-700 hover:underline">
          Edit
        </button>
        <Select
          value={vehicle.status}
          onChange={(e) => handleStatusChange(e.target.value as VehicleStatus)}
          className="!py-1 text-xs"
        >
          {(Object.keys(VEHICLE_STATUS_LABEL) as VehicleStatus[]).map((s) => (
            <option key={s} value={s}>
              {VEHICLE_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Link to={`/fleet/vehicles/${vehicle.id}/maintenance`} className="text-sm font-medium text-slate-700 hover:underline">
          Maintenance
        </Link>
        {canDelete && (
          <Button variant="danger" onClick={handleDelete} loading={deleteVehicle.isPending} className="!px-2 !py-1 text-xs">
            Retire
          </Button>
        )}
      </div>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  )
}
