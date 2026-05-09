package com.moviebooking;

import com.moviebooking.dto.RegisterRequest;
import com.moviebooking.repository.UserRepository;
import com.moviebooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Seeds a default manager account on startup if none exists.
 *
 * <p>Creates {@code admin@example.com} / {@code password} with role {@code MANAGER}
 * only when no MANAGER account exists for that email.</p>
 */
@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmailAndRole("admin@example.com", "MANAGER")) {
            return;
        }
        RegisterRequest req = new RegisterRequest();
        req.setFirstName("Admin");
        req.setLastName("User");
        req.setEmail("admin@example.com");
        req.setPassword("password");
        req.setRole("MANAGER");
        req.setDateOfBirth(LocalDate.of(1990, 1, 1));
        authService.registerUser(req);
    }
}
