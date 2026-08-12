import { client } from './client'
import type { AuthResponse, LoginRequest, RefreshRequest, RegisterRequest } from '../types/auth'

export const register = (body: RegisterRequest) =>
  client.post<AuthResponse>('/auth/register', body).then((r) => r.data)

export const login = (body: LoginRequest) =>
  client.post<AuthResponse>('/auth/login', body).then((r) => r.data)

export const refresh = (body: RefreshRequest) =>
  client.post<AuthResponse>('/auth/refresh', body).then((r) => r.data)

export const logout = (body: RefreshRequest) => client.post<void>('/auth/logout', body).then((r) => r.data)
