package com.mydrive.carplatform.payment;

import java.math.BigDecimal;

/**
 * Thin wrapper around the Stripe SDK so PaymentService can be tested without hitting the
 * network, and so no other class needs to know Stripe's API shape.
 */
public interface StripeGateway {

    PaymentIntentResult createPaymentIntent(BigDecimal amount, String currency, String idempotencyKey);

    /**
     * Re-fetches a PaymentIntent's client_secret. Used only when an idempotent retry finds a
     * Payment row that already has a stripePaymentIntentId -- the secret itself is never
     * persisted, and a PaymentIntent's client_secret is stable for its lifetime, so this is
     * safe to call repeatedly instead of creating a second PaymentIntent.
     */
    String retrieveClientSecret(String paymentIntentId);

    record PaymentIntentResult(String paymentIntentId, String clientSecret) {
    }
}
