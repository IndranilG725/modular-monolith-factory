package com.company.auth.infrastructure.persistence;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpringDataUserLoginRepository extends JpaRepository<UserLoginEntity, Long> {
    Optional<UserLoginEntity> findByUsername(String username);

    Boolean existsByUsername(String name);

    Boolean existsByEmail(String email);

    @Query("SELECT u FROM UserLoginEntity u WHERE u.username = :username OR u.email = :email")
    Optional<UserLoginEntity> findFirstByUsernameOrEmail(@Param("username") String username,
            @Param("email") String email);

    Optional<UserLoginEntity> findByEmail(String email);
}
