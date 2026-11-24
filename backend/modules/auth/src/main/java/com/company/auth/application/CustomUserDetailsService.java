package com.company.auth.application;

import java.util.Collections;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final AuthRepositoryPort authRepositoryPort;

    public CustomUserDetailsService(AuthRepositoryPort authRepositoryPort) {
        this.authRepositoryPort = authRepositoryPort;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return authRepositoryPort.findByUsername(username)
                .map(user -> new User(
                        user.getUsername(),
                        user.getPasswordHash(),
                        Collections.emptyList()))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }
}
