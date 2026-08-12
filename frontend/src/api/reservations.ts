import { client } from './client'
import type { PageResponse } from '../types/common'
import type {
  CompleteReservationRequest,
  ReservationListParams,
  ReservationRequest,
  ReservationResponse,
} from '../types/reservation'

export const listReservations = (params: ReservationListParams) =>
  client.get<PageResponse<ReservationResponse>>('/reservations', { params }).then((r) => r.data)

export const getReservation = (id: string) =>
  client.get<ReservationResponse>(`/reservations/${id}`).then((r) => r.data)

export const createReservation = (body: ReservationRequest) =>
  client.post<ReservationResponse>('/reservations', body).then((r) => r.data)

export const activateReservation = (id: string) =>
  client.post<ReservationResponse>(`/reservations/${id}/activate`).then((r) => r.data)

export const completeReservation = (id: string, body: CompleteReservationRequest) =>
  client.post<ReservationResponse>(`/reservations/${id}/complete`, body).then((r) => r.data)

export const cancelReservation = (id: string) =>
  client.post<ReservationResponse>(`/reservations/${id}/cancel`).then((r) => r.data)
