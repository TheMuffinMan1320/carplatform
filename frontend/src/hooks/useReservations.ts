import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as reservationsApi from '../api/reservations'
import type { CompleteReservationRequest, ReservationListParams, ReservationRequest } from '../types/reservation'

export function useReservationsQuery(params: ReservationListParams) {
  return useQuery({
    queryKey: ['reservations', params],
    queryFn: () => reservationsApi.listReservations(params),
  })
}

export function useReservationQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['reservation', id],
    queryFn: () => reservationsApi.getReservation(id!),
    enabled: !!id,
  })
}

function useInvalidateReservations() {
  const queryClient = useQueryClient()
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['reservations'] })
    if (id) queryClient.invalidateQueries({ queryKey: ['reservation', id] })
    queryClient.invalidateQueries({ queryKey: ['vehicles'] })
  }
}

export function useCreateReservation() {
  const invalidate = useInvalidateReservations()
  return useMutation({
    mutationFn: (body: ReservationRequest) => reservationsApi.createReservation(body),
    onSuccess: () => invalidate(),
  })
}

export function useActivateReservation(id: string) {
  const invalidate = useInvalidateReservations()
  return useMutation({
    mutationFn: () => reservationsApi.activateReservation(id),
    onSuccess: () => invalidate(id),
  })
}

export function useCompleteReservation(id: string) {
  const invalidate = useInvalidateReservations()
  return useMutation({
    mutationFn: (body: CompleteReservationRequest) => reservationsApi.completeReservation(id, body),
    onSuccess: () => invalidate(id),
  })
}

export function useCancelReservation(id: string) {
  const invalidate = useInvalidateReservations()
  return useMutation({
    mutationFn: () => reservationsApi.cancelReservation(id),
    onSuccess: () => invalidate(id),
  })
}
