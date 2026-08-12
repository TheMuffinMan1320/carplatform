package com.mydrive.carplatform.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mydrive.carplatform.auth.Role;
import com.mydrive.carplatform.booking.Reservation;
import com.mydrive.carplatform.booking.ReservationRepository;
import com.mydrive.carplatform.testsupport.AbstractApiIntegrationTest;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

class StripeWebhookIT extends AbstractApiIntegrationTest {

    private static final String WEBHOOK_SECRET = "whsec_test_only_secret_1234567890";

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Test
    void invalidSignatureIsRejectedBeforeAnyBusinessLogicRuns() throws Exception {
        String payload = eventPayload("evt_1", "payment_intent.succeeded", "pi_does_not_exist");
        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Stripe-Signature", "t=1,v1=deadbeef")
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validSignatureTransitionsPendingPaymentToSucceeded() throws Exception {
        Payment payment = seedPendingPayment("pi_webhook_test_1");

        String payload = eventPayload("evt_2", "payment_intent.succeeded", "pi_webhook_test_1");
        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Stripe-Signature", signatureHeader(payload))
                        .content(payload))
                .andExpect(status().isOk());

        Payment reloaded = paymentRepository.findById(payment.getId()).orElseThrow();
        assertThat(reloaded.getStatus()).isEqualTo(PaymentStatus.SUCCEEDED);
    }

    @Test
    void redeliveredEventForAlreadyTerminalPaymentIsANoOp() throws Exception {
        Payment payment = seedPendingPayment("pi_webhook_test_2");
        String payload = eventPayload("evt_3", "payment_intent.succeeded", "pi_webhook_test_2");
        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Stripe-Signature", signatureHeader(payload))
                        .content(payload))
                .andExpect(status().isOk());

        // Redeliver a payment_failed for the same (already-SUCCEEDED) PaymentIntent -- must be
        // ignored rather than flipping a terminal payment's status.
        String failedPayload = eventPayload("evt_4", "payment_intent.payment_failed", "pi_webhook_test_2");
        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Stripe-Signature", signatureHeader(failedPayload))
                        .content(failedPayload))
                .andExpect(status().isOk());

        Payment reloaded = paymentRepository.findById(payment.getId()).orElseThrow();
        assertThat(reloaded.getStatus()).isEqualTo(PaymentStatus.SUCCEEDED);
    }

    @Test
    void eventForUnknownPaymentIntentIsAcknowledgedNotErrored() throws Exception {
        String payload = eventPayload("evt_5", "payment_intent.succeeded", "pi_totally_unknown");
        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/payments/webhook/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Stripe-Signature", signatureHeader(payload))
                        .content(payload))
                .andExpect(status().isOk());
    }

    private Payment seedPendingPayment(String stripePaymentIntentId) throws Exception {
        String adminToken = registerWithRole(uniqueEmail("wadmin"), "supersecret1", Role.ADMIN, null);
        UUID locationId = createLocation(adminToken, "Webhook Branch " + stripePaymentIntentId);
        String agentToken = registerWithRole(uniqueEmail("wagent"), "supersecret1", Role.FLEET_AGENT, locationId);
        UUID vehicleId = createVehicle(agentToken, locationId, uniqueVin(), 70.00);
        var customer = register(uniqueEmail("wcustomer"), "supersecret1");

        String createBody =
                """
                {"vehicleId":"%s","startDate":"2027-04-01","endDate":"2027-04-01"}
                """
                        .formatted(vehicleId);
        String response = mockMvc.perform(post("/api/v1/reservations")
                        .header("Authorization", "Bearer " + customer.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        UUID reservationId = UUID.fromString(json.readTree(response).get("id").asText());
        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow();

        Payment payment = new Payment(reservation, new BigDecimal("70.00"), "usd", stripePaymentIntentId + "-idem");
        payment.setStripePaymentIntentId(stripePaymentIntentId);
        return paymentRepository.save(payment);
    }

    private static String eventPayload(String eventId, String type, String paymentIntentId) {
        return """
                {"id":"%s","object":"event","api_version":"2025-05-28.basil","type":"%s","data":{"object":{"id":"%s","object":"payment_intent","status":"succeeded"}}}
                """
                .formatted(eventId, type, paymentIntentId)
                .strip();
    }

    private static String signatureHeader(String payload) throws Exception {
        long timestamp = Instant.now().getEpochSecond();
        String signedPayload = timestamp + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder();
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return "t=" + timestamp + ",v1=" + hex;
    }
}
