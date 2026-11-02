package com.company.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.auth.dto.request.RegisterRequestDTO;
import com.company.auth.entity.UserLoginEntity;
import com.company.auth.repository.UserLoginRepository;

@Service
public class UserRegistrationService {
    private final UserLoginRepository userLoginRepository;
    private final PasswordEncoder passwordEncoder;

    public UserRegistrationService(UserLoginRepository userLoginRepository, PasswordEncoder passwordEncoder) {
        this.userLoginRepository = userLoginRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void registerNewUser(RegisterRequestDTO request) {
        // 1. Check if username or email already exists
        if (userLoginRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username is already taken!");
        }
        if (userLoginRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        // 2. HASH THE PASSWORD! (Crucial Security Step)
        String hashedPassword = passwordEncoder.encode(request.password());

        // 3. Create the new User entity
        UserLoginEntity newUserEntity = new UserLoginEntity(request.username(), hashedPassword, request.email());

        // 4. Save
        userLoginRepository.save(newUserEntity);
    }
}
