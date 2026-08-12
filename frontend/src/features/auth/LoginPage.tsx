import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { BrandMark } from '../../components/brand/BrandMark'
import { friendlyErrorMessage } from '../../lib/errorMapping'
import { homePathForRole } from '../../lib/roleHome'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await login({ email, password })
      const redirect = searchParams.get('redirect')
      navigate(redirect || homePathForRole(user.role), { replace: true })
    } catch (err) {
      setError(friendlyErrorMessage(err))
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
            Sign in to book, manage, or operate the fleet.
          </h1>
        </div>
        <p className="hidden font-mono text-[11px] uppercase tracking-[0.06em] text-blueprint-line-dim sm:block">
          Role-scoped access · customer / fleet agent / admin
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-sm">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <div className="rounded-[3px] border border-[#b3402c]/30 bg-[#fbe7e2] px-3 py-2 text-sm text-[#8f3222]">{error}</div>}
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button type="submit" loading={submitting} className="mt-2 w-full">
                Log in
              </Button>
            </form>
          </Card>
          <p className="mt-4 text-center text-sm text-ink-soft">
            No account?{' '}
            <Link to="/register" className="font-medium text-ink hover:text-signal">
              Register
            </Link>
          </p>
          <div className="mt-6 rounded-[3px] border border-ink/12 bg-white p-4">
            <p className="mb-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ink-soft">
              Demo accounts — password123
            </p>
            <p className="font-mono text-[11px] leading-relaxed text-ink-faint">
              admin@carplatform.dev
              <br />
              agent.downtown@carplatform.dev
              <br />
              agent.airport@carplatform.dev
              <br />
              customer@carplatform.dev
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
