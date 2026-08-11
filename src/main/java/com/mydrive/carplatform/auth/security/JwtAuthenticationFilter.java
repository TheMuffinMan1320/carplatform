package com.mydrive.carplatform.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Builds the {@link org.springframework.security.core.Authentication} directly from the access
 * token's claims -- no database round-trip per request. Login and refresh are the only points
 * that touch the database for auth purposes.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        extractToken(request)
                .flatMap(jwtService::parseAndValidate)
                .ifPresent(claims -> authenticate(request, claims));
        filterChain.doFilter(request, response);
    }

    private void authenticate(HttpServletRequest request, JwtService.AccessTokenClaims claims) {
        CurrentUser currentUser = new CurrentUser(claims.userId(), claims.email(), claims.role(), claims.locationId());
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + claims.role().name()));
        var authentication = new UsernamePasswordAuthenticationToken(currentUser, null, authorities);
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private Optional<String> extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return Optional.of(header.substring(BEARER_PREFIX.length()));
        }
        return Optional.empty();
    }
}
