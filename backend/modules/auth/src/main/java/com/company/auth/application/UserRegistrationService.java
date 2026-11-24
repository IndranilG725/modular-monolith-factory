package com.company.auth.application;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.auth.application.dto.request.RegisterRequestDTO;
import com.company.auth.domain.model.User;

@Service
public class UserRegistrationService {
    private final AuthRepositoryPort authRepositoryPort;
    private final PasswordEncoder passwordEncoder;

    public UserRegistrationService(AuthRepositoryPort authRepositoryPort, PasswordEncoder passwordEncoder) {
        this.authRepositoryPort = authRepositoryPort;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerNewUser(RegisterRequestDTO request) {
        // 1. Business rule: Uniqueness check
        authRepositoryPort.findFirstByUsernameOrEmail(request.username(), request.email())
                .ifPresent(existingUser -> {
                    if (existingUser.getUsername().equalsIgnoreCase(request.username())) {
                        throw new IllegalArgumentException("Username is already taken!");
                    }
                    if (existingUser.getEmail().equalsIgnoreCase(request.email())) {
                        throw new IllegalArgumentException("Email is already registered!");
                    }
                });

        // 2. Hash password
        String hashedPassword = passwordEncoder.encode(request.password());

        // 3. Create Domain Entity (enforces domain invariants)
        User newUser = User.register(request.username(), request.email(), hashedPassword);

        // 4. Save via outbound port
        return authRepositoryPort.save(newUser);
    }
}
