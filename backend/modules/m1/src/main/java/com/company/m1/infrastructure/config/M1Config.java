package com.company.m1.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.company.m1.domain.M1DomainService;

/**
 * Infrastructure configuration to register pure Java domain services as Spring
 * beans.
 * This keeps the domain layer 100% free of framework dependencies (pure Java).
 */
@Configuration
public class M1Config {

    @Bean
    public M1DomainService m1DomainService() {
        return new M1DomainService();
    }
}
