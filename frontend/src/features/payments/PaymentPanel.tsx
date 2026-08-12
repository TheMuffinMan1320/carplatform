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
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Payment</h2>

      <div className="mt-3 flex items-start gap-2.5 rounded-[3px] border border-signal/25 bg-signal-soft px-3 py-2.5 text-[13px] leading-relaxed text-ink-soft">
        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
        <span>
          This demo environment doesn't have a live Stripe key configured, so payment attempts are expected to
          come back <strong className="text-ink">Failed</strong> — that's the real payment-gateway error path, not a bug.
        </span>
      </div>

      <div className="dim-rule my-4" />

      {isLoading && <SkeletonRows count={2} />}

      {!isLoading && payments && payments.length > 0 && (
        <ul className="mb-4 flex flex-col gap-2">
          {payments.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-[3px] border border-ink/10 bg-vellum px-3 py-2.5 text-sm">
              <span className="font-mono text-ink">
                ${p.amount} {p.currency}
              </span>
              <Badge tone={PAYMENT_STATUS_TONE[p.status]}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && (!payments || payments.length === 0) && (
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">No payment attempts yet.</p>
      )}

      {error && <div className="mb-3 rounded-[3px] border border-[#b3402c]/30 bg-[#fbe7e2] px-3 py-2 text-sm text-[#8f3222]">{error}</div>}

      {latestPayment && (
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-soft">
          <span>Latest attempt:</span>
          <Badge tone={PAYMENT_STATUS_TONE[latestPayment.status]}>{PAYMENT_STATUS_LABEL[latestPayment.status]}</Badge>
        </div>
      )}

      <Button onClick={handlePay} loading={createPayment.isPending} disabled={hasSucceeded}>
        {hasSucceeded ? 'Already paid' : 'Pay Now'}
      </Button>
    </Card>
  )
}
