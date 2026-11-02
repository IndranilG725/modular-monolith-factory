package com.company.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

@ExtendWith(MockitoExtension.class)
@DisplayName("TokenService Unit Tests")
class TokenServiceTest {

    @Mock
    private JwtEncoder jwtEncoder;

    @Mock
    private JwtDecoder jwtDecoder;

    @InjectMocks
    private TokenService tokenService;

    @BeforeEach
    void setUp() {
        // TokenService default field values: 15 minutes access, 7 days refresh
    }

    private Jwt createMockJwt(String tokenValue, String subject, String type) {
        Instant now = Instant.now();
        return Jwt.withTokenValue(tokenValue)
                .header("alg", "RS256")
                .subject(subject)
                .issuer("my-company-app")
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.HOURS))
                .claim("type", type)
                .build();
    }

    @Test
    @DisplayName("Should generate valid access token with correct claims and expiration")
    void generateAccessToken_ShouldEncodeTokenWithAccessClaims() {
        // Arrange
        String username = "charlie";
        Jwt mockJwt = createMockJwt("mock.access.token", username, "ACCESS");
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(mockJwt);

        Instant beforeGeneration = Instant.now();

        // Act
        String tokenValue = tokenService.generateAccessToken(username);

        // Assert
        assertThat(tokenValue).isEqualTo("mock.access.token");

        ArgumentCaptor<JwtEncoderParameters> captor = ArgumentCaptor.forClass(JwtEncoderParameters.class);
        verify(jwtEncoder).encode(captor.capture());

        JwtClaimsSet claims = captor.getValue().getClaims();
        assertThat(claims.getSubject()).isEqualTo(username);
        assertThat(claims.getClaims()).containsEntry("iss", "my-company-app");
        assertThat(claims.getClaims()).containsEntry("type", "ACCESS");

        // Verify expiration is ~15 minutes in the future
        Instant expiresAt = claims.getExpiresAt();
        assertThat(expiresAt).isNotNull();
        assertThat(expiresAt.isAfter(beforeGeneration.plus(14, ChronoUnit.MINUTES))).isTrue();
        assertThat(expiresAt.isBefore(beforeGeneration.plus(16, ChronoUnit.MINUTES))).isTrue();
    }

    @Test
    @DisplayName("Should generate valid refresh token with correct claims and expiration")
    void generateRefreshToken_ShouldEncodeTokenWithRefreshClaims() {
        // Arrange
        String username = "charlie";
        Jwt mockJwt = createMockJwt("mock.refresh.token", username, "REFRESH");
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(mockJwt);

        Instant beforeGeneration = Instant.now();

        // Act
        String tokenValue = tokenService.generateRefreshToken(username);

        // Assert
        assertThat(tokenValue).isEqualTo("mock.refresh.token");

        ArgumentCaptor<JwtEncoderParameters> captor = ArgumentCaptor.forClass(JwtEncoderParameters.class);
        verify(jwtEncoder).encode(captor.capture());

        JwtClaimsSet claims = captor.getValue().getClaims();
        assertThat(claims.getSubject()).isEqualTo(username);
        assertThat(claims.getClaims()).containsEntry("iss", "my-company-app");
        assertThat(claims.getClaims()).containsEntry("type", "REFRESH");

        // Verify expiration is ~7 days in the future
        Instant expiresAt = claims.getExpiresAt();
        assertThat(expiresAt).isNotNull();
        assertThat(expiresAt.isAfter(beforeGeneration.plus(6, ChronoUnit.DAYS))).isTrue();
        assertThat(expiresAt.isBefore(beforeGeneration.plus(8, ChronoUnit.DAYS))).isTrue();
    }

    @Test
    @DisplayName("Should successfully validate refresh token and return username")
    void validateRefreshTokenAndGetUsername_WhenTokenIsValid_ShouldReturnUsername() {
        // Arrange
        String refreshToken = "valid.refresh.jwt";
        String expectedUsername = "david";
        Jwt decodedJwt = createMockJwt(refreshToken, expectedUsername, "REFRESH");

        when(jwtDecoder.decode(refreshToken)).thenReturn(decodedJwt);

        // Act
        String actualUsername = tokenService.validateRefreshTokenAndGetUsername(refreshToken);

        // Assert
        assertThat(actualUsername).isEqualTo(expectedUsername);
        verify(jwtDecoder).decode(refreshToken);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = { "   ", "\t", "\n" })
    @DisplayName("Should throw IllegalArgumentException when refresh token is null, empty, or whitespace")
    void validateRefreshTokenAndGetUsername_WhenTokenIsNullOrEmpty_ShouldThrowIllegalArgumentException(String invalidToken) {
        assertThatThrownBy(() -> tokenService.validateRefreshTokenAndGetUsername(invalidToken))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Refresh token is missing or empty.");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when token type is not REFRESH (e.g. ACCESS token)")
    void validateRefreshTokenAndGetUsername_WhenTokenTypeIsNotRefresh_ShouldThrowIllegalArgumentException() {
        // Arrange
        String wrongTypeToken = "access.token.passed.as.refresh";
        Jwt accessJwt = createMockJwt(wrongTypeToken, "david", "ACCESS");

        when(jwtDecoder.decode(wrongTypeToken)).thenReturn(accessJwt);

        // Act & Assert
        assertThatThrownBy(() -> tokenService.validateRefreshTokenAndGetUsername(wrongTypeToken))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid token type. Expected REFRESH token.");

        verify(jwtDecoder).decode(wrongTypeToken);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when token decoder fails (e.g. expired or invalid signature)")
    void validateRefreshTokenAndGetUsername_WhenDecoderThrowsJwtException_ShouldThrowIllegalArgumentException() {
        // Arrange
        String expiredToken = "expired.jwt.token";
        when(jwtDecoder.decode(expiredToken)).thenThrow(new BadJwtException("Jwt is expired"));

        // Act & Assert
        assertThatThrownBy(() -> tokenService.validateRefreshTokenAndGetUsername(expiredToken))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageStartingWith("Invalid or expired refresh token: Jwt is expired");

        verify(jwtDecoder).decode(expiredToken);
    }

    @Test
    @DisplayName("Should return correct duration and days for refresh token expiration")
    void getRefreshTokenExpiration_ShouldReturnConfiguredDuration() {
        assertThat(tokenService.getRefreshTokenExpirationDuration()).isEqualTo(Duration.ofDays(7));
        assertThat(tokenService.getRefreshTokenExpirationDays()).isEqualTo(7L);
    }
}
