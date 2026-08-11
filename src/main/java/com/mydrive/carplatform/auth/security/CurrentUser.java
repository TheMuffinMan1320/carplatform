package com.mydrive.carplatform.auth.security;

import com.mydrive.carplatform.auth.Role;
import java.util.UUID;

/**
 * The authenticated principal built directly from JWT claims by {@link JwtAuthenticationFilter}.
 * No database lookup happens per-request; this is a deliberate trade-off (see JwtAuthenticationFilter).
 */
public record CurrentUser(UUID userId, String email, Role role, UUID locationId) {

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public boolean isFleetAgent() {
        return role == Role.FLEET_AGENT;
    }

    public boolean isCustomer() {
        return role == Role.CUSTOMER;
    }
}
