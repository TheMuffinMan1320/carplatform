export type PaymentStatus = 'PENDING' | 'REQUIRES_ACTION' | 'SUCCEEDED' | 'FAILED' | 'CANCELED'

export interface PaymentResponse {
  id: string
  reservationId: string
  amount: string
  currency: string
  status: PaymentStatus
  clientSecret: string | null
}

export interface CreatePaymentRequest {
  reservationId: string
  idempotencyKey: string
}
