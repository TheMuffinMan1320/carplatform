import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useCreateLocation, useUpdateLocation } from '../../hooks/useLocations'
import { applyServerErrors } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'
import type { LocationRequest, LocationResponse } from '../../types/location'

interface FormState {
  name: string
  addressLine1: string
  addressLine2: string
  city: string
  region: string
  postalCode: string
  country: string
  phone: string
}

function toFormState(location: LocationResponse | undefined): FormState {
  return {
    name: location?.name ?? '',
    addressLine1: location?.addressLine1 ?? '',
    addressLine2: location?.addressLine2 ?? '',
    city: location?.city ?? '',
    region: location?.region ?? '',
    postalCode: location?.postalCode ?? '',
    country: location?.country ?? 'USA',
    phone: location?.phone ?? '',
  }
}

export function LocationFormModal({ location, onClose }: { location?: LocationResponse; onClose: () => void }) {
  const [form, setForm] = useState<FormState>(toFormState(location))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation(location?.id ?? '')
  const submitting = createLocation.isPending || updateLocation.isPending
  const { showToast } = useToast()

  const setField = <K extends keyof FormState>(field: K) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Name is required.'
    if (!form.addressLine1.trim()) errors.addressLine1 = 'Address is required.'
    if (!form.city.trim()) errors.city = 'City is required.'
    if (!form.region.trim()) errors.region = 'Region is required.'
    if (!form.postalCode.trim()) errors.postalCode = 'Postal code is required.'
    if (!form.country.trim()) errors.country = 'Country is required.'
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
    const body: LocationRequest = {
      name: form.name,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2 || undefined,
      city: form.city,
      region: form.region,
      postalCode: form.postalCode,
      country: form.country,
      phone: form.phone || undefined,
    }
    try {
      if (location) {
        await updateLocation.mutateAsync(body)
        showToast('Location updated.', 'success')
      } else {
        await createLocation.mutateAsync(body)
        showToast('Location created.', 'success')
      }
      onClose()
    } catch (err) {
      const message = applyServerErrors(err, (field, msg) => setFieldErrors((prev) => ({ ...prev, [field]: msg })))
      if (message) setFormError(message)
    }
  }

  return (
    <Modal title={location ? 'Edit Location' : 'Add Location'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>}
        <Input label="Name" value={form.name} onChange={(e) => setField('name')(e.target.value)} error={fieldErrors.name} />
        <Input
          label="Address line 1"
          value={form.addressLine1}
          onChange={(e) => setField('addressLine1')(e.target.value)}
          error={fieldErrors.addressLine1}
        />
        <Input
          label="Address line 2 (optional)"
          value={form.addressLine2}
          onChange={(e) => setField('addressLine2')(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="City" value={form.city} onChange={(e) => setField('city')(e.target.value)} error={fieldErrors.city} />
          <Input label="Region" value={form.region} onChange={(e) => setField('region')(e.target.value)} error={fieldErrors.region} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Postal code"
            value={form.postalCode}
            onChange={(e) => setField('postalCode')(e.target.value)}
            error={fieldErrors.postalCode}
          />
          <Input label="Country" value={form.country} onChange={(e) => setField('country')(e.target.value)} error={fieldErrors.country} />
        </div>
        <Input label="Phone (optional)" value={form.phone} onChange={(e) => setField('phone')(e.target.value)} />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {location ? 'Save changes' : 'Create location'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
