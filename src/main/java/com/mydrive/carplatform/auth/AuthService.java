package com.mydrive.carplatform.auth;

import com.mydrive.carplatform.auth.dto.AdminCreateUserRequest;
import com.mydrive.carplatform.auth.dto.AuthResponse;
import com.mydrive.carplatform.auth.dto.LoginRequest;
import com.mydrive.carplatform.auth.dto.RefreshRequest;
import com.mydrive.carplatform.auth.dto.RegisterRequest;
import com.mydrive.carplatform.auth.dto.UserSummary;
import com.mydrive.carplatform.auth.security.JwtProperties;
import com.mydrive.carplatform.auth.security.JwtService;
import com.mydrive.carplatform.common.exception.ConflictException;
import com.mydrive.carplatform.common.exception.ResourceNotFoundException;
import com.mydrive.carplatform.common.exception.UnauthorizedException;
import com.mydrive.carplatform.location.Location;
import com.mydrive.carplatform.location.LocationRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenRevocationService refreshTokenRevocationService;
    private final LocationRepository locationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final Duration refreshTokenTtl;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            RefreshTokenRevocationService refreshTokenRevocationService,
            LocationRepository locationRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JwtProperties jwtProperties) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenRevocationService = refreshTokenRevocationService;
        this.locationRepository = locationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenTtl = Duration.ofDays(jwtProperties.getRefreshTokenTtlDays());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("EMAIL_ALREADY_REGISTERED", "An account with this email already exists");
        }
        User user = new User(
                request.email().toLowerCase(),
                passwordEncoder.encode(request.password()),
                request.firstName(),
                request.lastName(),
                request.phone(),
                Role.CUSTOMER);
        user = userRepository.save(user);
        return issueTokens(user);
    }

    @Transactional
    public UserSummary adminCreateUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("EMAIL_ALREADY_REGISTERED", "An account with this email already exists");
        }
        User user = new User(
                request.email().toLowerCase(),
                passwordEncoder.encode(request.password()),
                request.firstName(),
                request.lastName(),
                request.phone(),
                request.role());
        if (request.locationId() != null) {
            Location location = locationRepository
                    .findById(request.locationId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Location", request.locationId()));
            user.setLocation(location);
        }
        return UserSummary.from(userRepository.save(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository
                .findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password"));
        if (!user.isEnabled()) {
            throw new UnauthorizedException("ACCOUNT_DISABLED", "This account has been disabled");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password");
        }
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String presentedHash = hash(request.refreshToken());
        RefreshToken existing = refreshTokenRepository
                .findByTokenHash(presentedHash)
                .orElseThrow(() -> new UnauthorizedException("INVALID_REFRESH_TOKEN", "Refresh token is invalid"));

        if (existing.isRevoked()) {
            // Reuse of an already-rotated/revoked token is a theft signal: nuke every active
            // refresh token for this user and force a fresh login. Runs in its own transaction
            // so the revocation survives even though this method's transaction rolls back when
            // the exception below propagates.
            refreshTokenRevocationService.revokeAllActiveForUserInNewTransaction(
                    existing.getUser().getId());
            throw new UnauthorizedException(
                    "REFRESH_TOKEN_REUSE_DETECTED", "This refresh token has already been used; please log in again");
        }
        if (existing.isExpired()) {
            throw new UnauthorizedException("REFRESH_TOKEN_EXPIRED", "Refresh token has expired");
        }

        User user = existing.getUser();
        if (!user.isEnabled()) {
            throw new UnauthorizedException("ACCOUNT_DISABLED", "This account has been disabled");
        }

        existing.setRevoked(true);
        RefreshToken rotated = createRefreshToken(user);
        existing.setReplacedById(rotated.getId());
        refreshTokenRepository.save(existing);

        return new AuthResponse(jwtService.generateAccessToken(user), rotated.getRawToken(), UserSummary.from(user));
    }

    @Transactional
    public void logout(RefreshRequest request) {
        String presentedHash = hash(request.refreshToken());
        refreshTokenRepository.findByTokenHash(presentedHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    private AuthResponse issueTokens(User user) {
        RefreshToken refreshToken = createRefreshToken(user);
        return new AuthResponse(
                jwtService.generateAccessToken(user), refreshToken.getRawToken(), UserSummary.from(user));
    }

    private RefreshToken createRefreshToken(User user) {
        String rawToken = generateOpaqueToken();
        RefreshToken token = new RefreshToken(user, hash(rawToken), Instant.now().plus(refreshTokenTtl));
        token.setRawToken(rawToken);
        return refreshTokenRepository.save(token);
    }

    private static String generateOpaqueToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hashed.length * 2);
            for (byte b : hashed) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}
