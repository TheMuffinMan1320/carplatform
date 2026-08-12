import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useCreateVehicle, useUpdateVehicle } from '../../hooks/useVehicles'
import { useLocationsQuery } from '../../hooks/useLocations'
import { applyServerErrors } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'
import { PRICING_TIER_LABEL } from '../../lib/enumLabels'
import type { PricingTier, VehicleRequest, VehicleResponse } from '../../types/vehicle'

interface VehicleFormModalProps {
  vehicle?: VehicleResponse
  defaultLocationId?: string
  lockLocation?: boolean
  onClose: () => void
}

interface FormState {
  locationId: string
  make: string
  model: string
  year: string
  vin: string
  licensePlate: string
  mileage: string
  pricingTier: PricingTier
  dailyRate: string
}

function toFormState(vehicle: VehicleResponse | undefined, defaultLocationId: string | undefined): FormState {
  return {
    locationId: vehicle?.locationId ?? defaultLocationId ?? '',
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    year: vehicle ? String(vehicle.year) : String(new Date().getFullYear()),
    vin: vehicle?.vin ?? '',
    licensePlate: vehicle?.licensePlate ?? '',
    mileage: vehicle ? String(vehicle.mileage) : '0',
    pricingTier: vehicle?.pricingTier ?? 'STANDARD',
    dailyRate: vehicle?.dailyRate ?? '',
  }
}

export function VehicleFormModal({ vehicle, defaultLocationId, lockLocation, onClose }: VehicleFormModalProps) {
  const { data: locationsPage } = useLocationsQuery({ size: 50 })
  const [form, setForm] = useState<FormState>(toFormState(vehicle, defaultLocationId))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle(vehicle?.id ?? '')
  const submitting = createVehicle.isPending || updateVehicle.isPending
  const { showToast } = useToast()

  const setField = <K extends keyof FormState>(field: K) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!form.locationId) errors.locationId = 'Location is required.'
    if (!form.make.trim()) errors.make = 'Make is required.'
    if (!form.model.trim()) errors.model = 'Model is required.'
    const year = Number(form.year)
    if (!Number.isInteger(year) || year < 1900) errors.year = 'Year must be 1900 or later.'
    if (form.vin.length < 11 || form.vin.length > 17) errors.vin = 'VIN must be 11-17 characters.'
    const mileage = Number(form.mileage)
    if (Number.isNaN(mileage) || mileage < 0) errors.mileage = 'Mileage must be 0 or more.'
    const dailyRate = Number(form.dailyRate)
    if (Number.isNaN(dailyRate) || dailyRate <= 0) errors.dailyRate = 'Daily rate must be greater than 0.'
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
    const body: VehicleRequest = {
      locationId: form.locationId,
      make: form.make,
      model: form.model,
      year: Number(form.year),
      vin: form.vin,
      licensePlate: form.licensePlate || undefined,
      mileage: Number(form.mileage),
      pricingTier: form.pricingTier,
      dailyRate: Number(form.dailyRate),
    }
    try {
      if (vehicle) {
        await updateVehicle.mutateAsync(body)
        showToast('Vehicle updated.', 'success')
      } else {
        await createVehicle.mutateAsync(body)
        showToast('Vehicle created.', 'success')
      }
      onClose()
    } catch (err) {
      const message = applyServerErrors(err, (field, msg) => setFieldErrors((prev) => ({ ...prev, [field]: msg })))
      if (message) setFormError(message)
    }
  }

  return (
    <Modal title={vehicle ? 'Edit Vehicle' : 'Add Vehicle'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && (
          <div className="rounded-[3px] border border-[#b3402c]/30 bg-[#fbe7e2] px-3 py-2 text-sm text-[#8f3222]">{formError}</div>
        )}
        <Select
          label="Location"
          value={form.locationId}
          onChange={(e) => setField('locationId')(e.target.value)}
          error={fieldErrors.locationId}
          disabled={lockLocation}
        >
          <option value="">Select a location</option>
          {locationsPage?.content.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Make" value={form.make} onChange={(e) => setField('make')(e.target.value)} error={fieldErrors.make} />
          <Input label="Model" value={form.model} onChange={(e) => setField('model')(e.target.value)} error={fieldErrors.model} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Year" type="number" value={form.year} onChange={(e) => setField('year')(e.target.value)} error={fieldErrors.year} />
          <Input label="Mileage" type="number" value={form.mileage} onChange={(e) => setField('mileage')(e.target.value)} error={fieldErrors.mileage} />
        </div>
        <Input label="VIN" value={form.vin} onChange={(e) => setField('vin')(e.target.value)} error={fieldErrors.vin} hint="11-17 characters" />
        <Input
          label="License plate (optional)"
          value={form.licensePlate}
          onChange={(e) => setField('licensePlate')(e.target.value)}
          error={fieldErrors.licensePlate}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Pricing tier" value={form.pricingTier} onChange={(e) => setField('pricingTier')(e.target.value)}>
            {(Object.keys(PRICING_TIER_LABEL) as PricingTier[]).map((t) => (
              <option key={t} value={t}>
                {PRICING_TIER_LABEL[t]}
              </option>
            ))}
          </Select>
          <Input
            label="Daily rate ($)"
            type="number"
            step="0.01"
            value={form.dailyRate}
            onChange={(e) => setField('dailyRate')(e.target.value)}
            error={fieldErrors.dailyRate}
          />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {vehicle ? 'Save changes' : 'Create vehicle'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
