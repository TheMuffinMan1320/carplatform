package com.mydrive.carplatform.auth;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Revokes refresh tokens in a transaction independent of the caller's. Used when a revoked
 * (already-rotated) refresh token is presented again -- a theft signal -- so that the
 * revocation commits even though the caller's own transaction is about to be rolled back by
 * the exception it throws to reject the request.
 */
@Service
public class RefreshTokenRevocationService {

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenRevocationService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void revokeAllActiveForUserInNewTransaction(UUID userId) {
        refreshTokenRepository.revokeAllActiveForUser(userId);
    }
}
