package com.company.myapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.company")
@EnableJpaRepositories(basePackages = "com.company") // Scans for JpaRepositories across all modules
@EntityScan(basePackages = "com.company") // Scans for @Entity classes across all modules
public class MainApplication {
    public static void main(String[] args) {
        SpringApplication.run(MainApplication.class, args);
    }
}
