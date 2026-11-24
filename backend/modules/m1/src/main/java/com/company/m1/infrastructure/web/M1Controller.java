package com.company.m1.infrastructure.web;

import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.company.m1.application.M1Service;
import com.company.m1.application.dto.response.M1DTO;
import com.company.shared.ratelimit.RateLimited;

@RestController
@RequestMapping("/api/v1/M1")
public class M1Controller {
    private final M1Service m1Service;

    public M1Controller(M1Service m1Service) {
        this.m1Service = m1Service;
    }

    @RateLimited(capacity = 5, refillTokens = 5, refillDuration = 1, unit = TimeUnit.MINUTES)
    @GetMapping("/{id}")
    ResponseEntity<M1DTO> m1Fn(@PathVariable Long id) {
        return new ResponseEntity<>(m1Service.getM1byId(id), HttpStatus.OK);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    ResponseEntity<Boolean> deleteById(@PathVariable Long id) {
        return new ResponseEntity<>(true, HttpStatus.OK);
    }
}
