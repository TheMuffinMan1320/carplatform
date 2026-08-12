import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RoleNav } from './RoleNav'
import { Button } from '../ui/Button'
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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link to={user ? homePathForRole(user.role) : '/vehicles'} className="text-lg font-bold text-slate-900">
              CarPlatform
            </Link>
            <RoleNav role={user?.role ?? null} />
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-slate-600">
                  {user.firstName} {user.lastName} · <span className="font-medium">{ROLE_LABEL[user.role]}</span>
                </span>
                <Button variant="secondary" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-400">
        CarPlatform demo UI — backend seed data, no live payment gateway configured.
      </footer>
    </div>
  )
}
