package com.mydrive.carplatform.booking;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.mydrive.carplatform.auth.Role;
import com.mydrive.carplatform.testsupport.AbstractApiIntegrationTest;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class ReservationLifecycleIT extends AbstractApiIntegrationTest {

    @Test
    void fullLifecycleAndOverlapRejection() throws Exception {
        String adminToken = registerWithRole(uniqueEmail("admin"), "supersecret1", Role.ADMIN, null);
        UUID locationId = createLocation(adminToken, "Test Branch");
        String agentToken = registerWithRole(uniqueEmail("agent"), "supersecret1", Role.FLEET_AGENT, locationId);
        UUID vehicleId = createVehicle(agentToken, locationId, uniqueVin(), 50.00);
        var customer = register(uniqueEmail("customer"), "supersecret1");
        String customerToken = customer.accessToken();

        // Create the first reservation.
        String createBody =
                """
                {"vehicleId":"%s","startDate":"2027-01-01","endDate":"2027-01-05"}
                """
                        .formatted(vehicleId);
        String createResponse = mockMvc.perform(post("/api/v1/reservations")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("RESERVED")))
                .andExpect(jsonPath("$.totalAmount", is(250.00)))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode created = json.readTree(createResponse);
        String reservationId = created.get("id").asText();

        // Overlapping booking is rejected -- exercises both the app-level pre-check and,
        // transitively, confirms the DB exclusion constraint from V6 didn't block the first insert.
        String overlappingBody =
                """
                {"vehicleId":"%s","startDate":"2027-01-03","endDate":"2027-01-06"}
                """
                        .formatted(vehicleId);
        mockMvc.perform(post("/api/v1/reservations")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(overlappingBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code", is("VEHICLE_NOT_AVAILABLE")));

        // Availability endpoint reflects the booking.
        mockMvc.perform(get("/api/v1/vehicles/{id}/availability", vehicleId)
                        .param("startDate", "2027-01-01")
                        .param("endDate", "2027-01-05"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available", is(false)));

        // Customer cannot activate (staff-only action).
        mockMvc.perform(post("/api/v1/reservations/{id}/activate", reservationId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        // Agent activates: RESERVED -> ACTIVE.
        mockMvc.perform(post("/api/v1/reservations/{id}/activate", reservationId)
                        .header("Authorization", "Bearer " + agentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACTIVE")));

        // Illegal transition: activating an already-ACTIVE reservation is rejected.
        mockMvc.perform(post("/api/v1/reservations/{id}/activate", reservationId)
                        .header("Authorization", "Bearer " + agentToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code", is("ILLEGAL_STATE_TRANSITION")));

        // Agent completes: ACTIVE -> COMPLETED, vehicle mileage updates.
        mockMvc.perform(post("/api/v1/reservations/{id}/complete", reservationId)
                        .header("Authorization", "Bearer " + agentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"endMileage\":1200}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")));

        mockMvc.perform(get("/api/v1/vehicles/{id}", vehicleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mileage", is(1200)))
                .andExpect(jsonPath("$.status", is("AVAILABLE")));

        // A COMPLETED reservation's dates are free again (overlap only blocks RESERVED/ACTIVE).
        mockMvc.perform(get("/api/v1/vehicles/{id}/availability", vehicleId)
                        .param("startDate", "2027-01-01")
                        .param("endDate", "2027-01-05"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available", is(true)));
    }

    @Test
    void customerCanOnlyCancelOwnReservedNotActiveReservation() throws Exception {
        String adminToken = registerWithRole(uniqueEmail("admin2"), "supersecret1", Role.ADMIN, null);
        UUID locationId = createLocation(adminToken, "Test Branch 2");
        String agentToken = registerWithRole(uniqueEmail("agent2"), "supersecret1", Role.FLEET_AGENT, locationId);
        UUID vehicleId = createVehicle(agentToken, locationId, uniqueVin(), 40.00);
        String customerToken = register(uniqueEmail("customer2"), "supersecret1").accessToken();
        String otherCustomerToken = register(uniqueEmail("customer3"), "supersecret1").accessToken();

        String createBody =
                """
                {"vehicleId":"%s","startDate":"2027-02-01","endDate":"2027-02-02"}
                """
                        .formatted(vehicleId);
        String reservationId = json.readTree(mockMvc.perform(post("/api/v1/reservations")
                                .header("Authorization", "Bearer " + customerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(createBody))
                        .andExpect(status().isCreated())
                        .andReturn()
                        .getResponse()
                        .getContentAsString())
                .get("id")
                .asText();

        // A different customer cannot cancel someone else's reservation.
        mockMvc.perform(post("/api/v1/reservations/{id}/cancel", reservationId)
                        .header("Authorization", "Bearer " + otherCustomerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/reservations/{id}/activate", reservationId)
                        .header("Authorization", "Bearer " + agentToken))
                .andExpect(status().isOk());

        // Owning customer cannot self-cancel once it's ACTIVE (picked up).
        mockMvc.perform(post("/api/v1/reservations/{id}/cancel", reservationId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code", is("CANNOT_CANCEL_ACTIVE_RESERVATION")));

        // Staff can still cancel an ACTIVE reservation.
        mockMvc.perform(post("/api/v1/reservations/{id}/cancel", reservationId)
                        .header("Authorization", "Bearer " + agentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));
    }
}
