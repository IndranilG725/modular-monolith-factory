package com.company.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.company.auth.entity.UserLoginEntity;

public interface UserLoginRepository extends JpaRepository<UserLoginEntity, Long> {
    Optional<UserLoginEntity> findByUsername(String username);

    Boolean existsByUsername(String name);

    Boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = :username OR u.email = :email")
    Optional<UserLoginEntity> findFirstByUsernameOrEmail(@Param("username") String username,
            @Param("email") String email);
}
