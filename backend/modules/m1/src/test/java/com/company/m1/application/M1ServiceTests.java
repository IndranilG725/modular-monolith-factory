package com.company.m1.application;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.company.m1.application.mapper.M1Mapper;
import com.company.m1.domain.M1DomainService;
import com.company.shared.exceptions.MyCustomException;

@ExtendWith(MockitoExtension.class) // Run without Spring overhead (blazing fast!)
public class M1ServiceTests {

    @Mock
    private M1RepositoryPort m1RepositoryPort;

    @Mock
    private M1DomainService m1DomainService;

    @Mock
    private M1Mapper m1Mapper;

    @InjectMocks
    private M1Service m1Service;

    @Test
    @DisplayName("Should throw exception if M1 does not exist")
    void m1_notFound_Exception() {
        // Arrange
        Long id = 152534L;
        when(m1RepositoryPort.findById(id)).thenThrow(new MyCustomException("M1 not found"));

        // Act & Assert
        assertThatThrownBy(() -> m1Service.getM1(id))
                .isInstanceOf(MyCustomException.class)
                .hasMessage("M1 not found");
    }
}
