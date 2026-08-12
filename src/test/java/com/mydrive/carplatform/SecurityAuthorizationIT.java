package com.mydrive.carplatform;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mydrive.carplatform.auth.Role;
import com.mydrive.carplatform.testsupport.AbstractApiIntegrationTest;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class SecurityAuthorizationIT extends AbstractApiIntegrationTest {

    @Test
    void fleetAgentCannotManageVehiclesAtAnotherLocation() throws Exception {
        String adminToken = registerWithRole(uniqueEmail("secadmin"), "supersecret1", Role.ADMIN, null);
        UUID locationA = createLocation(adminToken, "Location A");
        UUID locationB = createLocation(adminToken, "Location B");
        String agentAtA = registerWithRole(uniqueEmail("secagentA"), "supersecret1", Role.FLEET_AGENT, locationA);

        String body =
                """
                {"locationId":"%s","make":"Ford","model":"Focus","year":2021,"vin":"%s","mileage":500,"pricingTier":"ECONOMY","dailyRate":30.00}
                """
                        .formatted(locationB, uniqueVin());
        mockMvc.perform(post("/api/v1/vehicles")
                        .header("Authorization", "Bearer " + agentAtA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void customerCannotAccessAdminOrFleetOnlyEndpoints() throws Exception {
        String customerToken = register(uniqueEmail("seccust"), "supersecret1").accessToken();

        mockMvc.perform(get("/api/v1/admin/users").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/maintenance-alerts").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        String vehicleBody =
                """
                {"locationId":"%s","make":"Ford","model":"Focus","year":2021,"vin":"%s","mileage":500,"pricingTier":"ECONOMY","dailyRate":30.00}
                """
                        .formatted(UUID.randomUUID(), uniqueVin());
        mockMvc.perform(post("/api/v1/vehicles")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(vehicleBody))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminBypassesLocationScoping() throws Exception {
        String adminToken = registerWithRole(uniqueEmail("secadmin2"), "supersecret1", Role.ADMIN, null);
        UUID locationId = createLocation(adminToken, "Any Location");

        String body =
                """
                {"locationId":"%s","make":"Ford","model":"Focus","year":2021,"vin":"%s","mileage":500,"pricingTier":"ECONOMY","dailyRate":30.00}
                """
                        .formatted(locationId, uniqueVin());
        mockMvc.perform(post("/api/v1/vehicles")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());
    }

    @Test
    void publicEndpointsRequireNoAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/vehicles")).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/locations")).andExpect(status().isOk());
    }
}
