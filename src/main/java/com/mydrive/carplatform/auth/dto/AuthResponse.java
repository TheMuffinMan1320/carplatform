package com.mydrive.carplatform.auth.dto;

public record AuthResponse(String accessToken, String refreshToken, UserSummary user) {
}
