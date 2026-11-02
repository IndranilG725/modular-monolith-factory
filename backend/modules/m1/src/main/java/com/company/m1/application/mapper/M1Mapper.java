package com.company.m1.application.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.company.m1.application.dto.request.M1DTO;
import com.company.m1.infrastructure.persistence.M1JpaEntity;

@Mapper(componentModel = "spring")
public interface M1Mapper {
   @Mapping(target = "id", ignore = true)
   M1JpaEntity toEntity(M1DTO m1dto);

   com.company.m1.application.dto.response.M1DTO toDTO(M1JpaEntity d1Entity);

   @Mapping(target = "id", ignore = true)
   @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
   void updateFromDTO(M1DTO m1dto, @MappingTarget M1JpaEntity m1JpaEntity);
}
