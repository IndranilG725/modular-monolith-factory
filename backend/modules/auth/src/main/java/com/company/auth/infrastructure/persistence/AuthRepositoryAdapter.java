package com.company.auth.infrastructure.persistence;

import com.company.auth.application.AuthRepositoryPort;
import com.company.auth.domain.model.Role;
import com.company.auth.domain.model.User;

import java.util.Optional;

public class AuthRepositoryAdapter implements AuthRepositoryPort {
    private final SpringDataUserLoginRepository springDataUserLoginRepository;

    public AuthRepositoryAdapter(SpringDataUserLoginRepository springDataUserLoginRepository) {
        this.springDataUserLoginRepository = springDataUserLoginRepository;
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return springDataUserLoginRepository.findByUsername(username).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return springDataUserLoginRepository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<User> findFirstByUsernameOrEmail(String username, String email) {
        return springDataUserLoginRepository.findFirstByUsernameOrEmail(username, email).map(this::toDomain);
    }

    @Override
    public User save(User user) {
        UserLoginEntity entity = toEntity(user);
        UserLoginEntity saved = springDataUserLoginRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public boolean existsByUsername(String username) {
        return springDataUserLoginRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return springDataUserLoginRepository.existsByUsername(email);
    }

    // Mapping helpers (or use MapStruct like in the m1 module)
    private User toDomain(UserLoginEntity entity) {
        return new User(
                entity.getId(),
                entity.getUsername(),
                entity.getPassword(),
                entity.getEmail(),
                Role.ROLE_USER);
    }

    private UserLoginEntity toEntity(User domain) {
        UserLoginEntity entity = new UserLoginEntity(
                domain.getUsername(),
                domain.getPasswordHash(),
                domain.getEmail());
        return entity;
    }

}
