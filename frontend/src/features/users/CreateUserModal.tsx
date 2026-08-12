import { useState, type FormEvent } from 'react'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useCreateUser } from '../../hooks/useUsers'
import { useLocationsQuery } from '../../hooks/useLocations'
import { applyServerErrors } from '../../lib/errorMapping'
import { useToast } from '../../components/ui/ToastProvider'
import { ROLE_LABEL } from '../../lib/enumLabels'
import type { Role } from '../../types/user'

export function CreateUserModal({ onClose }: { onClose: () => void }) {
  const { data: locationsPage } = useLocationsQuery({ size: 50 })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('CUSTOMER')
  const [locationId, setLocationId] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const createUser = useCreateUser()
  const { showToast } = useToast()

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (password.length < 8 || password.length > 72) errors.password = 'Password must be 8-72 characters.'
    if (!firstName.trim()) errors.firstName = 'First name is required.'
    if (!lastName.trim()) errors.lastName = 'Last name is required.'
    if (role === 'FLEET_AGENT' && !locationId) errors.locationId = 'Fleet agents need a location.'
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
      await createUser.mutateAsync({
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        role,
        locationId: locationId || undefined,
      })
      showToast('User created.', 'success')
      onClose()
    } catch (err) {
      const message = applyServerErrors(err, (field, msg) => setFieldErrors((prev) => ({ ...prev, [field]: msg })))
      if (message) setFormError(message)
    }
  }

  return (
    <Modal title="Add User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>}
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={fieldErrors.firstName} />
          <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} error={fieldErrors.lastName} />
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="8-72 characters"
        />
        <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Select
          label="Role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role)
            setFieldErrors((prev) => ({ ...prev, locationId: '' }))
          }}
        >
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </Select>
        {role === 'FLEET_AGENT' && (
          <Select label="Location" value={locationId} onChange={(e) => setLocationId(e.target.value)} error={fieldErrors.locationId}>
            <option value="">Select a location</option>
            {locationsPage?.content.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </Select>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createUser.isPending}>
            Create user
          </Button>
        </div>
      </form>
    </Modal>
  )
}
