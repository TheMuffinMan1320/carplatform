import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RoleNav } from './RoleNav'
import { Button } from '../ui/Button'
import { BrandMark } from '../brand/BrandMark'
import { ROLE_LABEL } from '../../lib/enumLabels'
import { homePathForRole } from '../../lib/roleHome'

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/vehicles')
  }

  return (
    <div className="flex min-h-screen flex-col bg-vellum">
      <header className="border-b border-ink/12 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <Link
              to={user ? homePathForRole(user.role) : '/vehicles'}
              className="flex items-center gap-2 font-display text-lg font-semibold tracking-[-0.01em] text-ink"
            >
              <BrandMark className="h-6 w-6" />
              MyDrive
            </Link>
            <RoleNav role={user?.role ?? null} />
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden font-mono text-[11px] uppercase tracking-[0.06em] text-ink-soft sm:inline">
                  {user.firstName} {user.lastName} <span className="text-ink-faint">/</span> {ROLE_LABEL[user.role]}
                </span>
                <Button variant="secondary" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-display text-[13px] font-medium text-ink-soft hover:text-ink">
                  Log in
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-ink/12 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
          <span>MyDrive — demo build</span>
          <span>Seed data · no live payment gateway configured</span>
        </div>
      </footer>
    </div>
  )
}
