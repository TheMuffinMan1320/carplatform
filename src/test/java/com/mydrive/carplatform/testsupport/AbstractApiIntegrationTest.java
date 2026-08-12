package com.mydrive.carplatform.testsupport;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mydrive.carplatform.AbstractIntegrationTest;
import com.mydrive.carplatform.auth.Role;
import com.mydrive.carplatform.auth.User;
import com.mydrive.carplatform.auth.UserRepository;
import com.mydrive.carplatform.location.LocationRepository;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.transaction.annotation.Transactional;

/**
 * Shared fixture helpers for integration tests that need authenticated users of each role.
 * Promotion to FLEET_AGENT/ADMIN goes directly through the repository rather than the
 * admin-creation API endpoint -- bootstrapping the very first admin has no other path, and
 * reusing the same approach for fleet agents keeps fixture setup uniform.
 */
public abstract class AbstractApiIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected LocationRepository locationRepository;

    protected final ObjectMapper json = new ObjectMapper();

    protected record TokenPair(String accessToken, String refreshToken, String userId) {
    }

    protected TokenPair register(String email, String password) throws Exception {
        String body = """
                {"email":"%s","password":"%s","firstName":"Test","lastName":"User"}
                """.formatted(email, password);
        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode node = json.readTree(response);
        return new TokenPair(
                node.get("accessToken").asText(), node.get("refreshToken").asText(), node.get("user").get("id").asText());
    }

    protected String login(String email, String password) throws Exception {
        String body = """
                {"email":"%s","password":"%s"}
                """.formatted(email, password);
        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return json.readTree(response).get("accessToken").asText();
    }

    /** Registers a user, then promotes them to the given role (and location, for FLEET_AGENT), returning a fresh token. */
    @Transactional
    protected String registerWithRole(String email, String password, Role role, UUID locationId) throws Exception {
        register(email, password);
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        user.setRole(role);
        if (locationId != null) {
            user.setLocation(locationRepository.getReferenceById(locationId));
        }
        userRepository.save(user);
        return login(email, password);
    }

    protected UUID createLocation(String adminToken, String name) throws Exception {
        String body =
                """
                {"name":"%s","addressLine1":"1 Test St","city":"Austin","region":"TX","postalCode":"78701","country":"USA"}
                """
                        .formatted(name);
        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/locations")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return UUID.fromString(json.readTree(response).get("id").asText());
    }

    protected UUID createVehicle(String agentToken, UUID locationId, String vin, double dailyRate) throws Exception {
        String body =
                """
                {"locationId":"%s","make":"Toyota","model":"Camry","year":2023,"vin":"%s","mileage":1000,"pricingTier":"STANDARD","dailyRate":%s}
                """
                        .formatted(locationId, vin, dailyRate);
        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/vehicles")
                        .header("Authorization", "Bearer " + agentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return UUID.fromString(json.readTree(response).get("id").asText());
    }

    protected static String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@example.com";
    }

    protected static String uniqueVin() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 17).toUpperCase();
    }
}
