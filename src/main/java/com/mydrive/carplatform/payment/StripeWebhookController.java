package com.mydrive.carplatform.payment;

import com.mydrive.carplatform.payment.config.StripeProperties;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments/webhook")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final PaymentService paymentService;
    private final StripeProperties stripeProperties;

    public StripeWebhookController(PaymentService paymentService, StripeProperties stripeProperties) {
        this.paymentService = paymentService;
        this.stripeProperties = stripeProperties;
    }

    @PostMapping("/stripe")
    public ResponseEntity<Void> handle(
            @RequestBody String payload, @RequestHeader("Stripe-Signature") String signatureHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, signatureHeader, stripeProperties.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            // Reject before any business logic runs -- this is the non-negotiable security
            // step for webhooks. Never trust a payload whose signature doesn't check out.
            log.warn("Rejected Stripe webhook with invalid signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Optional<StripeObject> dataObject = event.getDataObjectDeserializer().getObject();
        if (dataObject.isEmpty() || !(dataObject.get() instanceof PaymentIntent intent)) {
            // Not a PaymentIntent event (or an API-version mismatch we can't deserialize) --
            // acknowledge with 200 so Stripe doesn't keep retrying an event we'll never handle.
            return ResponseEntity.ok().build();
        }

        String failureReason = intent.getLastPaymentError() != null ? intent.getLastPaymentError().getMessage() : null;
        paymentService.handleStripeEvent(event.getType(), intent.getId(), failureReason);
        return ResponseEntity.ok().build();
    }
}
