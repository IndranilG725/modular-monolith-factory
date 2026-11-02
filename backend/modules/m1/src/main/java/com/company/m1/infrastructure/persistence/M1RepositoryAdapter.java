package com.company.m1.infrastructure.persistence;

import org.springframework.stereotype.Repository;

import com.company.m1.application.M1RepositoryPort;
import com.company.m1.application.dto.request.M1DTO;
import com.company.m1.application.mapper.M1Mapper;
import com.company.shared.exceptions.MyCustomException;

@Repository
public class M1RepositoryAdapter implements M1RepositoryPort {
    private final SprinDataM1Repository sprinDataM1Repository;
    private final M1Mapper m1Mapper;

    public M1RepositoryAdapter(SprinDataM1Repository sprinDataM1Repository, M1Mapper m1Mapper) {
        this.sprinDataM1Repository = sprinDataM1Repository;
        this.m1Mapper = m1Mapper;
    }

    @Override
    public M1JpaEntity save(M1DTO m1dto) {
        return sprinDataM1Repository.save(m1Mapper.toEntity(m1dto));
    }

    @Override
    public M1JpaEntity findById(Long id) {
        return sprinDataM1Repository.findById(id).orElseThrow(() -> new MyCustomException("Not found"));
    }
}
