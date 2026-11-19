package com.pointage.config;

import com.pointage.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner {

    private final UserService userService;

    // Initial admin password, read from the ADMIN_PASSWORD environment variable.
    // Only used the first time the app starts, when no admin account exists yet.
    @Value("${ADMIN_PASSWORD:admin}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (!userService.hasAdmin()) {
            userService.createAdmin("admin", adminPassword);
        }
    }
}
