import type { UserSummary } from '../types/user'

export interface StoredAuth {
  accessToken: string
  refreshToken: string
  user: UserSummary
}

const STORAGE_KEY = 'carplatform.auth'
type Listener = (auth: StoredAuth | null) => void
const listeners = new Set<Listener>()

export function getStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  listeners.forEach((listener) => listener(auth))
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY)
  listeners.forEach((listener) => listener(null))
}

export function subscribeToAuthChanges(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
