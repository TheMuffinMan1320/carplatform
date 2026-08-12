import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as paymentsApi from '../api/payments'
import type { CreatePaymentRequest, PaymentStatus } from '../types/payment'

const POLLABLE_STATUSES: PaymentStatus[] = ['PENDING', 'REQUIRES_ACTION']

export function useReservationPayments(reservationId: string | undefined) {
  return useQuery({
    queryKey: ['reservation-payments', reservationId],
    queryFn: () => paymentsApi.listReservationPayments(reservationId!),
    enabled: !!reservationId,
  })
}

export function usePayment(paymentId: string | undefined) {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentsApi.getPayment(paymentId!),
    enabled: !!paymentId,
    refetchInterval: (query) => (query.state.data && POLLABLE_STATUSES.includes(query.state.data.status) ? 3000 : false),
  })
}

export function useCreatePayment(reservationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePaymentRequest) => paymentsApi.createPayment(body),
    // Invalidate on settle, not just success: a gateway failure (502) still
    // persists a FAILED payment record server-side before it throws, so the
    // payment history should refresh even when the mutation itself errors.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation-payments', reservationId] })
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] })
    },
  })
}
