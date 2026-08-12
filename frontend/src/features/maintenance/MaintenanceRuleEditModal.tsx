import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useUpdateMaintenanceRule } from '../../hooks/useMaintenance'
import { applyServerErrors } from '../../lib/errorMapping'
import { SERVICE_TYPE_LABEL } from '../../lib/enumLabels'
import { useToast } from '../../components/ui/ToastProvider'
import type { MaintenanceRuleResponse } from '../../types/maintenance'

export function MaintenanceRuleEditModal({ rule, onClose }: { rule: MaintenanceRuleResponse; onClose: () => void }) {
  const { showToast } = useToast()
  const [mileageInterval, setMileageInterval] = useState(String(rule.mileageInterval))
  const [timeIntervalMonths, setTimeIntervalMonths] = useState(String(rule.timeIntervalMonths))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const updateRule = useUpdateMaintenanceRule()

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!Number.isInteger(Number(mileageInterval)) || Number(mileageInterval) < 1) {
      errors.mileageInterval = 'Must be a whole number of at least 1.'
    }
    if (!Number.isInteger(Number(timeIntervalMonths)) || Number(timeIntervalMonths) < 1) {
      errors.timeIntervalMonths = 'Must be a whole number of at least 1.'
    }
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
      await updateRule.mutateAsync({
        serviceType: rule.serviceType,
        body: { mileageInterval: Number(mileageInterval), timeIntervalMonths: Number(timeIntervalMonths) },
      })
      showToast('Maintenance rule updated.', 'success')
      onClose()
    } catch (err) {
      const message = applyServerErrors(err, (field, msg) => setFieldErrors((prev) => ({ ...prev, [field]: msg })))
      if (message) setFormError(message)
    }
  }

  return (
    <Modal title={`Edit rule — ${SERVICE_TYPE_LABEL[rule.serviceType]}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>}
        <Input
          label="Mileage interval"
          type="number"
          value={mileageInterval}
          onChange={(e) => setMileageInterval(e.target.value)}
          error={fieldErrors.mileageInterval}
          hint="Miles between required services"
        />
        <Input
          label="Time interval (months)"
          type="number"
          value={timeIntervalMonths}
          onChange={(e) => setTimeIntervalMonths(e.target.value)}
          error={fieldErrors.timeIntervalMonths}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updateRule.isPending}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
