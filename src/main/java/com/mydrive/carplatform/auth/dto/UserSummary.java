package com.mydrive.carplatform.auth.dto;

import com.mydrive.carplatform.auth.Role;
import com.mydrive.carplatform.auth.User;
import java.util.UUID;

public record UserSummary(
        UUID id, String email, String firstName, String lastName, String phone, Role role, UUID locationId) {

    public static UserSummary from(User user) {
        return new UserSummary(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole(),
                user.getLocation() != null ? user.getLocation().getId() : null);
    }
}
