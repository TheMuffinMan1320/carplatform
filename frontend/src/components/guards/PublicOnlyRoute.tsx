import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homePathForRole } from '../../lib/roleHome'

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }
  return <>{children}</>
}
