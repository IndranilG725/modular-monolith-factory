package com.company.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.company.auth.dto.request.RegisterRequestDTO;
import com.company.auth.entity.UserLoginEntity;
import com.company.auth.repository.UserLoginRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserRegistrationService Unit Tests")
class UserRegistrationServiceTest {

    @Mock
    private UserLoginRepository userLoginRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserRegistrationService userRegistrationService;

    @Test
    @DisplayName("Should successfully hash password and save entity when username and email are unique")
    void registerNewUser_WhenDataIsValid_ShouldEncodePasswordAndSaveEntity() {
        // Arrange
        String rawPassword = "SecurePassword123!";
        String encodedPassword = "$2a$10$encodedSecurePasswordHash";
        RegisterRequestDTO request = new RegisterRequestDTO("alice", "alice@example.com", rawPassword);

        when(userLoginRepository.existsByUsername(request.username())).thenReturn(false);
        when(userLoginRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);

        // Act
        userRegistrationService.registerNewUser(request);

        // Assert
        ArgumentCaptor<UserLoginEntity> entityCaptor = ArgumentCaptor.forClass(UserLoginEntity.class);
        verify(userLoginRepository).save(entityCaptor.capture());

        UserLoginEntity savedEntity = entityCaptor.getValue();
        assertThat(savedEntity.getUsername()).isEqualTo("alice");
        assertThat(savedEntity.getPassword()).isEqualTo(encodedPassword);
        assertThat(savedEntity.getEmail()).isEqualTo("alice@example.com");

        verify(passwordEncoder).encode(rawPassword);
        verify(userLoginRepository).existsByUsername("alice");
        verify(userLoginRepository).existsByEmail("alice@example.com");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when username is already taken")
    void registerNewUser_WhenUsernameAlreadyExists_ShouldThrowIllegalArgumentException() {
        // Arrange
        RegisterRequestDTO request = new RegisterRequestDTO("existing_user", "unique@example.com", "Password123!");
        when(userLoginRepository.existsByUsername(request.username())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userRegistrationService.registerNewUser(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Username is already taken!");

        verify(userLoginRepository).existsByUsername(request.username());
        verify(userLoginRepository, never()).existsByEmail(any());
        verify(passwordEncoder, never()).encode(any());
        verify(userLoginRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when email is already registered")
    void registerNewUser_WhenEmailAlreadyExists_ShouldThrowIllegalArgumentException() {
        // Arrange
        RegisterRequestDTO request = new RegisterRequestDTO("new_user", "taken@example.com", "Password123!");
        when(userLoginRepository.existsByUsername(request.username())).thenReturn(false);
        when(userLoginRepository.existsByEmail(request.email())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userRegistrationService.registerNewUser(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email is already registered!");

        verify(userLoginRepository).existsByUsername(request.username());
        verify(userLoginRepository).existsByEmail(request.email());
        verify(passwordEncoder, never()).encode(any());
        verify(userLoginRepository, never()).save(any());
    }
}

