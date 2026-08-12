package com.mydrive.carplatform.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;

import com.fasterxml.jackson.databind.JsonNode;
import com.mydrive.carplatform.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

class AuthFlowIT extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    // A plain local instance, not a Spring bean: the app's autoconfigured JSON mapper is
    // Jackson 3's tools.jackson.databind.ObjectMapper (see JwtAuthenticationEntryPoint for
    // why), but this test only needs to read a couple of string fields out of a response body.
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Test
    void registerLoginAccessProtectedRefreshAndReuseDetection() throws Exception {
        String email = "auth-it-" + System.nanoTime() + "@example.com";
        String registerBody =
                """
                {"email":"%s","password":"supersecret1","firstName":"Ana","lastName":"Tester"}
                """
                        .formatted(email);

        String registerResponse = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(MockMvcResultMatchers.status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode registerJson = objectMapper.readTree(registerResponse);
        String accessToken = registerJson.get("accessToken").asText();
        String refreshToken = registerJson.get("refreshToken").asText();
        assertThat(accessToken).isNotBlank();
        assertThat(refreshToken).isNotBlank();

        // Protected endpoint: 401 without a token.
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/users/me"))
                .andExpect(MockMvcResultMatchers.status().isUnauthorized());

        // Protected endpoint: 200 with the token, returns the registered user.
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/users/me").header("Authorization", "Bearer " + accessToken))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.email", is(email)))
                .andExpect(MockMvcResultMatchers.jsonPath("$.role", is("CUSTOMER")));

        // Refresh rotates the token.
        String refreshBody = """
                {"refreshToken":"%s"}
                """.formatted(refreshToken);
        String refreshedResponse = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String newRefreshToken = objectMapper.readTree(refreshedResponse).get("refreshToken").asText();
        assertThat(newRefreshToken).isNotEqualTo(refreshToken);

        // Reusing the now-rotated-away original token is rejected...
        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody))
                .andExpect(MockMvcResultMatchers.status().isUnauthorized())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code", is("REFRESH_TOKEN_REUSE_DETECTED")));

        // ...and that reuse revokes the whole chain, including the token issued by the refresh above.
        String secondRefreshBody =
                """
                {"refreshToken":"%s"}
                """
                        .formatted(newRefreshToken);
        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(secondRefreshBody))
                .andExpect(MockMvcResultMatchers.status().isUnauthorized());
    }

    @Test
    void loginWithWrongPasswordIsRejected() throws Exception {
        String email = "auth-it-badpw-" + System.nanoTime() + "@example.com";
        String registerBody =
                """
                {"email":"%s","password":"correcthorse1","firstName":"Bea","lastName":"Tester"}
                """
                        .formatted(email);
        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(MockMvcResultMatchers.status().isCreated());

        String loginBody = """
                {"email":"%s","password":"wrongpassword"}
                """.formatted(email);
        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(MockMvcResultMatchers.status().isUnauthorized())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code", is("INVALID_CREDENTIALS")));
    }

    @Test
    void duplicateRegistrationIsRejected() throws Exception {
        String email = "auth-it-dup-" + System.nanoTime() + "@example.com";
        String registerBody =
                """
                {"email":"%s","password":"supersecret1","firstName":"Cid","lastName":"Tester"}
                """
                        .formatted(email);
        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(MockMvcResultMatchers.status().isCreated());
        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(MockMvcResultMatchers.status().isConflict())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code", is("EMAIL_ALREADY_REGISTERED")));
    }
}
