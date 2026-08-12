import { client } from './client'
import type { PageParams, PageResponse } from '../types/common'
import type { AdminCreateUserRequest, UserSummary } from '../types/user'

export const getMe = () => client.get<UserSummary>('/users/me').then((r) => r.data)

export const adminCreateUser = (body: AdminCreateUserRequest) =>
  client.post<UserSummary>('/admin/users', body).then((r) => r.data)

export const adminListUsers = (params: PageParams) =>
  client.get<PageResponse<UserSummary>>('/admin/users', { params }).then((r) => r.data)
