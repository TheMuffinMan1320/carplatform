import { client } from './client'
import type { CreatePaymentRequest, PaymentResponse } from '../types/payment'

export const createPayment = (body: CreatePaymentRequest) =>
  client.post<PaymentResponse>('/payments', body).then((r) => r.data)

export const getPayment = (id: string) => client.get<PaymentResponse>(`/payments/${id}`).then((r) => r.data)

export const listReservationPayments = (reservationId: string) =>
  client.get<PaymentResponse[]>(`/reservations/${reservationId}/payments`).then((r) => r.data)
