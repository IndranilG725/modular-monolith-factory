package com.company.m1.application;

import com.company.m1.application.dto.request.M1DTO;
import com.company.m1.infrastructure.persistence.M1JpaEntity;

public interface M1RepositoryPort {
    M1JpaEntity save(M1DTO m1dto);

    M1JpaEntity findById(Long id);
}
