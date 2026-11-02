package com.company.auth.controller;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.company.auth.dto.request.LoginRequestDTO;
import com.company.auth.dto.request.RegisterRequestDTO;
import com.company.auth.dto.response.LoginResponseDTO;
import com.company.auth.service.TokenService;
import com.company.auth.service.UserRegistrationService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    public static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private final TokenService tokenService;
    private final AuthenticationManager authenticationManager;
    private final UserRegistrationService registrationService;

    @Value("${jwt.cookie.secure:false}")
    private boolean cookieSecure;

    public AuthController(
            TokenService tokenService,
            AuthenticationManager authenticationManager,
            UserRegistrationService registrationService) {
        this.tokenService = tokenService;
        this.authenticationManager = authenticationManager;
        this.registrationService = registrationService;
    }

    /**
     * Authenticates user, generates short-lived access token for in-memory frontend
     * storage,
     * and sets long-lived refresh token in an HttpOnly secure cookie.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        // 1. Authenticate user credentials
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDTO.username(),
                        loginRequestDTO.password()));

        String username = authentication.getName();

        // 2. Generate tokens
        String accessToken = tokenService.generateAccessToken(username);
        String refreshToken = tokenService.generateRefreshToken(username);

        // 3. Set refresh token in HttpOnly cookie
        ResponseCookie cookie = createRefreshTokenCookie(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new LoginResponseDTO(accessToken));
    }

    /**
     * Registers a new user, hashes password, generates short-lived access token,
     * and sets long-lived refresh token in an HttpOnly secure cookie.
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponseDTO> register(@RequestBody RegisterRequestDTO registerRequestDTO) {
        registrationService.registerNewUser(registerRequestDTO);

        String username = registerRequestDTO.username();

        String accessToken = tokenService.generateAccessToken(username);
        String refreshToken = tokenService.generateRefreshToken(username);

        ResponseCookie cookie = createRefreshTokenCookie(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new LoginResponseDTO(accessToken));
    }

    /**
     * Reads refresh token from HttpOnly cookie, verifies it, issues a new access
     * token,
     * and rotates the refresh token cookie.
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDTO> refresh(
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String username = tokenService.validateRefreshTokenAndGetUsername(refreshToken);

            // Generate new in-memory access token and rotated refresh token
            String newAccessToken = tokenService.generateAccessToken(username);
            String newRefreshToken = tokenService.generateRefreshToken(username);

            ResponseCookie cookie = createRefreshTokenCookie(newRefreshToken);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new LoginResponseDTO(newAccessToken));
        } catch (IllegalArgumentException ex) {
            // Invalid or expired refresh token
            ResponseCookie clearCookie = createClearRefreshTokenCookie();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                    .build();
        }
    }

    /**
     * Clears the HttpOnly refresh token cookie on logout.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie clearCookie = createClearRefreshTokenCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .build();
    }

    private ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/v1/auth")
                .maxAge(tokenService.getRefreshTokenExpirationDuration())
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie createClearRefreshTokenCookie() {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/v1/auth")
                .maxAge(Duration.ZERO)
                .sameSite("Lax")
                .build();
    }
}
