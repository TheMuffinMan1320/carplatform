import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as usersApi from '../api/users'
import type { AdminCreateUserRequest } from '../types/user'
import type { PageParams } from '../types/common'

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.getMe(),
    enabled,
  })
}

export function useAdminUsers(params: PageParams) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => usersApi.adminListUsers(params),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AdminCreateUserRequest) => usersApi.adminCreateUser(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}
