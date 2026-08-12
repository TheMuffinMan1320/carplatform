package com.mydrive.carplatform.payment;

import com.mydrive.carplatform.common.exception.PaymentGatewayException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class StripeGatewayImpl implements StripeGateway {

    private static final Logger log = LoggerFactory.getLogger(StripeGatewayImpl.class);

    @Override
    public PaymentIntentResult createPaymentIntent(BigDecimal amount, String currency, String idempotencyKey) {
        long amountInSmallestUnit = amount.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInSmallestUnit)
                .setCurrency(currency.toLowerCase())
                .setAutomaticPaymentMethods(PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build())
                .build();
        // The caller's idempotency key is passed straight through as Stripe's own request
        // idempotency key: if our server retries this call after e.g. a network timeout,
        // Stripe guarantees it won't create a second PaymentIntent or double-charge the card.
        RequestOptions options =
                RequestOptions.builder().setIdempotencyKey(idempotencyKey).build();
        try {
            PaymentIntent intent = PaymentIntent.create(params, options);
            return new PaymentIntentResult(intent.getId(), intent.getClientSecret());
        } catch (StripeException e) {
            log.error("Stripe PaymentIntent creation failed for idempotencyKey={}", idempotencyKey, e);
            throw new PaymentGatewayException("Payment could not be processed: " + e.getMessage());
        }
    }

    @Override
    public String retrieveClientSecret(String paymentIntentId) {
        try {
            return PaymentIntent.retrieve(paymentIntentId).getClientSecret();
        } catch (StripeException e) {
            log.error("Stripe PaymentIntent retrieval failed for paymentIntentId={}", paymentIntentId, e);
            throw new PaymentGatewayException("Payment could not be retrieved: " + e.getMessage());
        }
    }
}
