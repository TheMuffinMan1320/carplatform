package com.mydrive.carplatform.auth.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.mydrive.carplatform.auth.Role;
import com.mydrive.carplatform.auth.User;
import com.mydrive.carplatform.location.Location;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-key-at-least-256-bits-long-1234567890";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret(SECRET);
        properties.setAccessTokenTtlMinutes(15);
        properties.setRefreshTokenTtlDays(30);
        jwtService = new JwtService(properties);
    }

    @Test
    void generatesAndParsesAccessTokenClaims() throws Exception {
        User user = customerUser();
        String token = jwtService.generateAccessToken(user);

        var claims = jwtService.parseAndValidate(token);

        assertThat(claims).isPresent();
        assertThat(claims.get().userId()).isEqualTo(user.getId());
        assertThat(claims.get().email()).isEqualTo(user.getEmail());
        assertThat(claims.get().role()).isEqualTo(Role.CUSTOMER);
        assertThat(claims.get().locationId()).isNull();
    }

    @Test
    void includesLocationIdClaimForFleetAgent() throws Exception {
        User agent = new User("agent@example.com", "hash", "Fred", "Agent", null, Role.FLEET_AGENT);
        setId(agent, UUID.randomUUID());
        Location location = new Location("Loc", "123 St", null, "City", "ST", "00000", "USA", null);
        setId(location, UUID.randomUUID());
        agent.setLocation(location);

        String token = jwtService.generateAccessToken(agent);
        var claims = jwtService.parseAndValidate(token);

        assertThat(claims).isPresent();
        assertThat(claims.get().locationId()).isEqualTo(location.getId());
    }

    @Test
    void rejectsTamperedToken() throws Exception {
        String token = jwtService.generateAccessToken(customerUser());
        String tampered = token.substring(0, token.length() - 1) + (token.endsWith("A") ? "B" : "A");

        assertThat(jwtService.parseAndValidate(tampered)).isEmpty();
    }

    @Test
    void rejectsExpiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());
        Instant past = Instant.now().minusSeconds(3600);
        String expiredToken = Jwts.builder()
                .subject(UUID.randomUUID().toString())
                .claim("email", "expired@example.com")
                .claim("role", "CUSTOMER")
                .issuer("carplatform")
                .issuedAt(Date.from(past.minusSeconds(60)))
                .expiration(Date.from(past))
                .signWith(key)
                .compact();

        assertThat(jwtService.parseAndValidate(expiredToken)).isEmpty();
    }

    @Test
    void rejectsTokenSignedWithDifferentSecret() {
        SecretKey otherKey = Keys.hmacShaKeyFor("a-completely-different-256-bit-secret-key-value".getBytes());
        String tokenFromAnotherIssuerKey = Jwts.builder()
                .subject(UUID.randomUUID().toString())
                .claim("email", "someone@example.com")
                .claim("role", "CUSTOMER")
                .issuer("carplatform")
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(otherKey)
                .compact();

        assertThat(jwtService.parseAndValidate(tokenFromAnotherIssuerKey)).isEmpty();
    }

    private static User customerUser() throws Exception {
        User user = new User("customer@example.com", "hash", "Carla", "Customer", null, Role.CUSTOMER);
        setId(user, UUID.randomUUID());
        return user;
    }

    /** BaseEntity's id is only assignable via the persistence layer in real use; tests set it via reflection. */
    private static void setId(Object entity, UUID id) throws Exception {
        Field field = entity.getClass().getSuperclass().getDeclaredField("id");
        field.setAccessible(true);
        field.set(entity, id);
    }
}
