package com.company.auth.application;

import java.util.Optional;
import com.company.auth.domain.model.User;

public interface AuthRepositoryPort {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findFirstByUsernameOrEmail(String username, String email);

    User save(User user);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
