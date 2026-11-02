package com.company.m1.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.company.m1.application.dto.response.M1DTO;
import com.company.m1.application.mapper.M1Mapper;
import com.company.m1.domain.M1;
import com.company.m1.domain.M1DomainService;

// Here it fetches data from port, calls the domain logic and saves data back via port

@Service
public class M1Service {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final M1Mapper m1Mapper;

    // Dependency Injection of the Port and Domain Service
    private final M1RepositoryPort m1RepositoryPort;
    private final M1DomainService m1DomainService;

    public M1Service(M1RepositoryPort m1RepositoryPort, M1DomainService m1DomainService, M1Mapper m1Mapper) {
        this.m1RepositoryPort = m1RepositoryPort;
        this.m1DomainService = m1DomainService;
        this.m1Mapper = m1Mapper;
    }

    public void myFunc() {
        M1 m1 = new M1();

        m1DomainService.myFunc(m1);
    }

    public M1DTO getM1(Long id) {
        logger.info("Trying to fetch M1 by id: {}", id);
        return m1Mapper.toDTO(m1RepositoryPort.findById(id));
    }
}
