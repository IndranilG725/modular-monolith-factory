package com.company.auth.domain.model;

import java.util.Objects;

public class User {
    private final Long id;
    private final String username;
    private String passwordHash;
    private final String email;
    private Role role;

    // Factory method for registering a new user (before DB ID exists)
    public static User register(String username, String email, String passwordHash) {
        validateUsername(username);
        validateEmail(email);
        Objects.requireNonNull(passwordHash, "Password hash must not be null");
        return new User(null, username, passwordHash, email, Role.ROLE_USER);
    }

    // Constructor for reconstituting from database
    public User(Long id, String username, String passwordHash, String email, Role role) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.email = email;
        this.role = role != null ? role : Role.ROLE_USER;
    }

    // Business Invariants
    private static void validateUsername(String username) {
        if (username == null || username.trim().length() < 3) {
            throw new IllegalArgumentException("Username must be at least 3 characters long");
        }
    }

    private static void validateEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email address format");
        }
    }

    // Domain business methods
    public void changePassword(String newPasswordHash) {
        Objects.requireNonNull(newPasswordHash, "New password hash must not be null");
        this.passwordHash = newPasswordHash;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }
}
