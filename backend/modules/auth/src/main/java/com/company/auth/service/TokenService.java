package com.company.auth.service;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    // Pull the times from application.yml
    @Value("${jwt.access-token-expiration-minutes:15}")
    private long accessTokenExpirationMinutes = 15;

    @Value("${jwt.refresh-token-expiration-days:7}")
    private long refreshTokenExpirationDays = 7;

    public TokenService(JwtEncoder jwtEncoder, JwtDecoder jwtDecoder) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
    }

    // 1. Generate Access Token (Short-lived, held in frontend memory)
    public String generateAccessToken(String username) {
        Instant now = Instant.now();
        Instant expiration = now.plus(accessTokenExpirationMinutes, ChronoUnit.MINUTES);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("my-company-app")
                .issuedAt(now)
                .expiresAt(expiration)
                .subject(username)
                .claim("type", "ACCESS")
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    // 2. Generate Refresh Token (Longer-lived, stored in HttpOnly cookie)
    public String generateRefreshToken(String username) {
        Instant now = Instant.now();
        Instant expiration = now.plus(refreshTokenExpirationDays, ChronoUnit.DAYS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("my-company-app")
                .issuedAt(now)
                .expiresAt(expiration)
                .subject(username)
                .claim("type", "REFRESH")
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    // 3. Validate Refresh Token and extract the username
    public String validateRefreshTokenAndGetUsername(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is missing or empty.");
        }
        try {
            Jwt jwt = jwtDecoder.decode(refreshToken);
            String tokenType = jwt.getClaimAsString("type");
            if (!"REFRESH".equals(tokenType)) {
                throw new IllegalArgumentException("Invalid token type. Expected REFRESH token.");
            }
            return jwt.getSubject();
        } catch (JwtException e) {
            throw new IllegalArgumentException("Invalid or expired refresh token: " + e.getMessage(), e);
        }
    }

    public Duration getRefreshTokenExpirationDuration() {
        return Duration.ofDays(refreshTokenExpirationDays);
    }

    public long getRefreshTokenExpirationDays() {
        return refreshTokenExpirationDays;
    }
}
