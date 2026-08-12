import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { useCreatePayment, usePayment, useReservationPayments } from '../../hooks/usePayments'
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE } from '../../lib/enumLabels'
import { friendlyErrorMessage } from '../../lib/errorMapping'
import { newIdempotencyKey } from '../../lib/idempotency'

export function PaymentPanel({ reservationId }: { reservationId: string }) {
  const { data: payments, isLoading } = useReservationPayments(reservationId)
  const [latestPaymentId, setLatestPaymentId] = useState<string | undefined>(undefined)
  const { data: latestPayment } = usePayment(latestPaymentId)
  const createPayment = useCreatePayment(reservationId)
  const [error, setError] = useState<string | null>(null)

  const hasSucceeded = payments?.some((p) => p.status === 'SUCCEEDED')

  const handlePay = async () => {
    setError(null)
    try {
      const payment = await createPayment.mutateAsync({ reservationId, idempotencyKey: newIdempotencyKey() })
      setLatestPaymentId(payment.id)
    } catch (err) {
      setError(friendlyErrorMessage(err))
    }
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Payment</h2>

      <div className="mb-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
        This demo environment doesn't have a live Stripe key configured, so payment attempts are expected to
        come back <strong>Failed</strong> — that reflects the real payment-gateway error path, not a bug.
      </div>

      {isLoading && <SkeletonRows count={2} />}

      {!isLoading && payments && payments.length > 0 && (
        <ul className="mb-4 flex flex-col gap-2">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
              <span>
                ${p.amount} {p.currency}
              </span>
              <Badge tone={PAYMENT_STATUS_TONE[p.status]}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && (!payments || payments.length === 0) && (
        <p className="mb-4 text-sm text-slate-500">No payment attempts yet.</p>
      )}

      {error && <div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

      {latestPayment && (
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span className="text-slate-600">Latest attempt:</span>
          <Badge tone={PAYMENT_STATUS_TONE[latestPayment.status]}>{PAYMENT_STATUS_LABEL[latestPayment.status]}</Badge>
        </div>
      )}

      <Button onClick={handlePay} loading={createPayment.isPending} disabled={hasSucceeded}>
        {hasSucceeded ? 'Already paid' : 'Pay Now'}
      </Button>
    </Card>
  )
}
