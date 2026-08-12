import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Input, Select, TextArea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useCreateMaintenanceRecord } from '../../hooks/useMaintenance'
import { applyServerErrors } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'
import { SERVICE_TYPE_LABEL } from '../../lib/enumLabels'
import type { ServiceType } from '../../types/maintenance'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function MaintenanceRecordFormModal({ vehicleId, onClose }: { vehicleId: string; onClose: () => void }) {
  const [serviceType, setServiceType] = useState<ServiceType>('OIL_CHANGE')
  const [performedAt, setPerformedAt] = useState(todayIso())
  const [mileageAtService, setMileageAtService] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const createRecord = useCreateMaintenanceRecord(vehicleId)
  const { showToast } = useToast()

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (performedAt > todayIso()) errors.performedAt = 'Must be today or earlier.'
    const mileage = Number(mileageAtService)
    if (Number.isNaN(mileage) || mileage < 0) errors.mileageAtService = 'Mileage must be 0 or more.'
    if (notes.length > 2000) errors.notes = 'Notes must be 2000 characters or fewer.'
    return errors
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    const clientErrors = validate()
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      return
    }
    try {
      await createRecord.mutateAsync({
        serviceType,
        performedAt,
        mileageAtService: Number(mileageAtService),
        cost: cost ? Number(cost) : undefined,
        notes: notes || undefined,
      })
      showToast('Maintenance record added.', 'success')
      onClose()
    } catch (err) {
      const message = applyServerErrors(err, (field, msg) => setFieldErrors((prev) => ({ ...prev, [field]: msg })))
      if (message) setFormError(message)
    }
  }

  return (
    <Modal title="Add Maintenance Record" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>}
        <Select label="Service type" value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)}>
          {(Object.keys(SERVICE_TYPE_LABEL) as ServiceType[]).map((s) => (
            <option key={s} value={s}>
              {SERVICE_TYPE_LABEL[s]}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Performed at"
            type="date"
            max={todayIso()}
            value={performedAt}
            onChange={(e) => setPerformedAt(e.target.value)}
            error={fieldErrors.performedAt}
          />
          <Input
            label="Mileage at service"
            type="number"
            value={mileageAtService}
            onChange={(e) => setMileageAtService(e.target.value)}
            error={fieldErrors.mileageAtService}
          />
        </div>
        <Input label="Cost ($, optional)" type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
        <TextArea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          error={fieldErrors.notes}
          rows={3}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createRecord.isPending}>
            Save record
          </Button>
        </div>
      </form>
    </Modal>
  )
}
