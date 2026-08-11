package com.mydrive.carplatform.auth.security;

import com.mydrive.carplatform.auth.Role;
import com.mydrive.carplatform.auth.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_LOCATION_ID = "locationId";
    private static final String ISSUER = "carplatform";

    private final SecretKey signingKey;
    private final Duration accessTokenTtl;

    public JwtService(JwtProperties properties) {
        this.signingKey = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
        this.accessTokenTtl = Duration.ofMinutes(properties.getAccessTokenTtlMinutes());
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .subject(user.getId().toString())
                .claim(CLAIM_EMAIL, user.getEmail())
                .claim(CLAIM_ROLE, user.getRole().name())
                .issuer(ISSUER)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessTokenTtl)))
                .id(UUID.randomUUID().toString());
        if (user.getLocation() != null) {
            builder.claim(CLAIM_LOCATION_ID, user.getLocation().getId().toString());
        }
        return builder.signWith(signingKey).compact();
    }

    public Optional<AccessTokenClaims> parseAndValidate(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(ISSUER)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            UUID userId = UUID.fromString(claims.getSubject());
            Role role = Role.valueOf(claims.get(CLAIM_ROLE, String.class));
            String email = claims.get(CLAIM_EMAIL, String.class);
            String locationIdClaim = claims.get(CLAIM_LOCATION_ID, String.class);
            UUID locationId = locationIdClaim == null ? null : UUID.fromString(locationIdClaim);
            return Optional.of(new AccessTokenClaims(userId, email, role, locationId));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public record AccessTokenClaims(UUID userId, String email, Role role, UUID locationId) {
    }
}
