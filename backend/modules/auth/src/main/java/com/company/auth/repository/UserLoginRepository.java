package com.company.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.company.auth.entity.UserLoginEntity;

public interface UserLoginRepository extends JpaRepository<UserLoginEntity, Long> {
    Optional<UserLoginEntity> findByUsername(String username);

    Boolean existsByUsername(String name);

    Boolean existsByEmail(String email);
}
