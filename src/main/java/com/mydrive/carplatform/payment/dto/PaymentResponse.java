package com.mydrive.carplatform.payment.dto;

import com.mydrive.carplatform.payment.Payment;
import com.mydrive.carplatform.payment.PaymentStatus;
import java.math.BigDecimal;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID reservationId,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        String clientSecret) {

    public static PaymentResponse from(Payment payment) {
        return from(payment, null);
    }

    /**
     * clientSecret is returned only from the create-payment response, for one-time
     * client-side use (Stripe.js / the Stripe mobile SDK) -- it is never persisted and never
     * echoed back on subsequent reads.
     */
    public static PaymentResponse from(Payment payment, String clientSecret) {
        return new PaymentResponse(
                payment.getId(),
                payment.getReservation().getId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                clientSecret);
    }
}
