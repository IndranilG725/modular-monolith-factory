package com.company.m1.infrastructure.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.company.m1.application.M1Service;
import com.company.m1.application.dto.response.M1DTO;

@RestController
@RequestMapping("/api/v1/M1")
public class M1Controller {
    private final M1Service m1Service;

    public M1Controller(M1Service m1Service) {
        this.m1Service = m1Service;
    }

    @GetMapping("/{id}")
    ResponseEntity<M1DTO> m1Fn(@PathVariable Long id) {
        return new ResponseEntity<>(m1Service.getM1(id), HttpStatus.OK);
    }
}
