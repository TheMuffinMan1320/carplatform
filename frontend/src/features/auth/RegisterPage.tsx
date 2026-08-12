import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { BrandMark } from '../../components/brand/BrandMark'
import { applyServerErrors } from '../../lib/errorMapping'
import { homePathForRole } from '../../lib/roleHome'

interface FormState {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

const INITIAL: FormState = { email: '', password: '', firstName: '', lastName: '', phone: '' }

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const setField = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (form.password.length < 8 || form.password.length > 72) {
      errors.password = 'Password must be 8-72 characters.'
    }
    if (!form.firstName.trim()) errors.firstName = 'First name is required.'
    if (!form.lastName.trim()) errors.lastName = 'Last name is required.'
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
    setSubmitting(true)
    try {
      const user = await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
      })
      navigate(homePathForRole(user.role), { replace: true })
    } catch (err) {
      const message = applyServerErrors(err, (field, msg) => setFieldErrors((prev) => ({ ...prev, [field]: msg })))
      if (message) setFormError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="-mx-4 -mt-8 grid grid-cols-1 sm:-mx-6 lg:min-h-[calc(100vh-8.5rem)] lg:grid-cols-2">
      <div className="drafting-grid relative flex flex-col gap-6 overflow-hidden bg-blueprint px-6 py-8 text-blueprint-line sm:px-10 sm:py-10 lg:justify-between lg:gap-0 lg:py-12">
        <Link to="/vehicles" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <BrandMark className="h-6 w-6" />
          MyDrive
        </Link>
        <div className="relative flex flex-col gap-3">
          <h1 className="max-w-sm font-display text-2xl font-semibold leading-[1.15] text-white sm:text-3xl">
            Create an account to start booking.
          </h1>
        </div>
        <p className="hidden font-mono text-[11px] uppercase tracking-[0.06em] text-blueprint-line-dim sm:block">
          Every registration starts as a customer role
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-sm">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {formError && (
                <div className="rounded-[3px] border border-[#b3402c]/30 bg-[#fbe7e2] px-3 py-2 text-sm text-[#8f3222]">{formError}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Input label="First name" required value={form.firstName} onChange={setField('firstName')} error={fieldErrors.firstName} />
                <Input label="Last name" required value={form.lastName} onChange={setField('lastName')} error={fieldErrors.lastName} />
              </div>
              <Input
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={setField('email')}
                error={fieldErrors.email}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={setField('password')}
                error={fieldErrors.password}
                hint="8-72 characters"
                autoComplete="new-password"
              />
              <Input label="Phone (optional)" value={form.phone} onChange={setField('phone')} error={fieldErrors.phone} />
              <Button type="submit" loading={submitting} className="mt-2 w-full">
                Create account
              </Button>
            </form>
          </Card>
          <p className="mt-4 text-center text-sm text-ink-soft">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-ink hover:text-signal">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
