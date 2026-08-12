package com.mydrive.carplatform.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.mydrive.carplatform.auth.Role;
import com.mydrive.carplatform.testsupport.AbstractApiIntegrationTest;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

class PaymentIT extends AbstractApiIntegrationTest {

    @MockitoBean
    private StripeGateway stripeGateway;

    @Autowired
    private PaymentRepository paymentRepository;

    private String setUpReservation(String suffix, double dailyRate) throws Exception {
        String adminToken = registerWithRole(uniqueEmail("padmin" + suffix), "supersecret1", Role.ADMIN, null);
        UUID locationId = createLocation(adminToken, "Payment Branch " + suffix);
        String agentToken = registerWithRole(uniqueEmail("pagent" + suffix), "supersecret1", Role.FLEET_AGENT, locationId);
        UUID vehicleId = createVehicle(agentToken, locationId, uniqueVin(), dailyRate);
        var customer = register(uniqueEmail("pcustomer" + suffix), "supersecret1");

        String createBody =
                """
                {"vehicleId":"%s","startDate":"2027-03-01","endDate":"2027-03-01"}
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
        return customer.accessToken() + "|" + json.readTree(response).get("id").asText();
    }

    @Test
    void createsPaymentAndPassesIdempotencyKeyThroughToStripe() throws Exception {
        String[] parts = setUpReservation("1", 75.00).split("\\|");
        String customerToken = parts[0];
        String reservationId = parts[1];

        when(stripeGateway.createPaymentIntent(new BigDecimal("75.00"), "usd", "idem-key-1"))
                .thenReturn(new StripeGateway.PaymentIntentResult("pi_test_1", "secret_1"));

        String body = """
                {"reservationId":"%s","idempotencyKey":"idem-key-1"}
                """.formatted(reservationId);
        mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.clientSecret", is("secret_1")));
    }

    @Test
    void duplicateIdempotencyKeyDoesNotCallStripeTwice() throws Exception {
        String[] parts = setUpReservation("2", 60.00).split("\\|");
        String customerToken = parts[0];
        String reservationId = parts[1];

        when(stripeGateway.createPaymentIntent(new BigDecimal("60.00"), "usd", "idem-key-2"))
                .thenReturn(new StripeGateway.PaymentIntentResult("pi_test_2", "secret_2"));
        when(stripeGateway.retrieveClientSecret("pi_test_2")).thenReturn("secret_2_refetched");

        String body = """
                {"reservationId":"%s","idempotencyKey":"idem-key-2"}
                """.formatted(reservationId);

        String firstResponse = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String firstPaymentId = json.readTree(firstResponse).get("id").asText();

        // Retried request with the same idempotency key must not create a second Payment row
        // or call Stripe's create endpoint again.
        String secondResponse = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode second = json.readTree(secondResponse);
        assertThat(second.get("id").asText()).isEqualTo(firstPaymentId);
        assertThat(second.get("clientSecret").asText()).isEqualTo("secret_2_refetched");

        long count = paymentRepository.findAll().stream()
                .filter(p -> p.getIdempotencyKey().equals("idem-key-2"))
                .count();
        assertThat(count).isEqualTo(1);
    }

    @Test
    void customerCannotPayAnotherCustomersReservation() throws Exception {
        String[] parts = setUpReservation("3", 80.00).split("\\|");
        String reservationId = parts[1];
        String otherCustomerToken = register(uniqueEmail("pother3"), "supersecret1").accessToken();

        String body = """
                {"reservationId":"%s","idempotencyKey":"idem-key-3"}
                """.formatted(reservationId);
        mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + otherCustomerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void stripeFailureLeavesAPersistedFailedPaymentRow() throws Exception {
        String[] parts = setUpReservation("4", 90.00).split("\\|");
        String customerToken = parts[0];
        String reservationId = parts[1];

        when(stripeGateway.createPaymentIntent(new BigDecimal("90.00"), "usd", "idem-key-4"))
                .thenThrow(new com.mydrive.carplatform.common.exception.PaymentGatewayException("simulated gateway failure"));

        String body = """
                {"reservationId":"%s","idempotencyKey":"idem-key-4"}
                """.formatted(reservationId);
        mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadGateway());

        var failed = paymentRepository.findByIdempotencyKey("idem-key-4").orElseThrow();
        assertThat(failed.getStatus()).isEqualTo(PaymentStatus.FAILED);
    }
}
