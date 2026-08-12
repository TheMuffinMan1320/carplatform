import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthResponse } from '../types/auth'
import type { ApiError } from '../types/common'
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../lib/authStorage'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const client = axios.create({ baseURL: API_BASE_URL })

client.interceptors.request.use((config) => {
  const auth = getStoredAuth()
  if (auth?.accessToken) {
    config.headers.set('Authorization', `Bearer ${auth.accessToken}`)
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const auth = getStoredAuth()
  if (!auth?.refreshToken) return null
  try {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: auth.refreshToken,
    })
    setStoredAuth(response.data)
    return response.data.accessToken
  } catch {
    clearStoredAuth()
    return null
  }
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined
    const isAuthEndpoint = config?.url?.includes('/auth/') ?? false
    if (error.response?.status === 401 && config && !config._retry && !isAuthEndpoint) {
      config._retry = true
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newAccessToken = await refreshPromise
      if (newAccessToken) {
        config.headers.set('Authorization', `Bearer ${newAccessToken}`)
        return client(config)
      }
    }
    return Promise.reject(error)
  },
)

export function getApiError(error: unknown): ApiError | null {
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data as ApiError
  }
  return null
}
