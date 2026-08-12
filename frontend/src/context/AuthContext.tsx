import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import * as usersApi from '../api/users'
import { clearStoredAuth, getStoredAuth, setStoredAuth, subscribeToAuthChanges } from '../lib/authStorage'
import type { UserSummary } from '../types/user'
import type { LoginRequest, RegisterRequest } from '../types/auth'

type AuthStatus = 'authenticated' | 'anonymous'

interface AuthContextValue {
  user: UserSummary | null
  status: AuthStatus
  login: (body: LoginRequest) => Promise<UserSummary>
  register: (body: RegisterRequest) => Promise<UserSummary>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const hadStoredAuthOnMount = useRef(getStoredAuth() != null)
  const [user, setUser] = useState<UserSummary | null>(() => getStoredAuth()?.user ?? null)
  const [status, setStatus] = useState<AuthStatus>(() => (hadStoredAuthOnMount.current ? 'authenticated' : 'anonymous'))

  useEffect(() => {
    return subscribeToAuthChanges((auth) => {
      setUser(auth?.user ?? null)
      setStatus(auth ? 'authenticated' : 'anonymous')
    })
  }, [])

  useEffect(() => {
    if (!hadStoredAuthOnMount.current) return
    usersApi
      .getMe()
      .then((me) => {
        const current = getStoredAuth()
        if (current) setStoredAuth({ ...current, user: me })
      })
      .catch(() => {
        // interceptor already attempted a token refresh; if it failed, storage was cleared there
      })
  }, [])

  const login = useCallback(async (body: LoginRequest) => {
    const auth = await authApi.login(body)
    setStoredAuth(auth)
    return auth.user
  }, [])

  const register = useCallback(async (body: RegisterRequest) => {
    const auth = await authApi.register(body)
    setStoredAuth(auth)
    return auth.user
  }, [])

  const logout = useCallback(async () => {
    const current = getStoredAuth()
    clearStoredAuth()
    if (current?.refreshToken) {
      try {
        await authApi.logout({ refreshToken: current.refreshToken })
      } catch {
        // best-effort: local session is already cleared regardless of server response
      }
    }
  }, [])

  const value = useMemo(() => ({ user, status, login, register, logout }), [user, status, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
