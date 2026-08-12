import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
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
    <div className="mx-auto max-w-sm py-12">
      <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">Create an account</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>}
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
          <Button type="submit" loading={submitting} className="mt-2">
            Create account
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-slate-900 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
