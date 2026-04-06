package com.moviebooking.controller;

import com.moviebooking.dto.EmailLookupRequest;
import com.moviebooking.dto.LoginRequest;
import com.moviebooking.dto.LoginResponse;
import com.moviebooking.dto.RegisterRequest;
import com.moviebooking.entity.Login;
import com.moviebooking.entity.User;
import com.moviebooking.exception.BadRequestException;
import com.moviebooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Step 1: client submits email, receives list of roles registered to it.
    // Frontend skips the role-selection screen when the list has exactly one entry.
    @PostMapping("/login/email")
    public ResponseEntity<?> lookup(@RequestBody EmailLookupRequest request) {
        List<String> roles = authService.lookupRoles(request.getEmail());
        if (roles.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No account found for that email");
        }
        return ResponseEntity.ok(Map.of("roles", roles));
    }

    // Step 2: client submits email + role + password, receives session token.
    @PostMapping("/login/password")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Login login = authService.loginAndGenerateToken(
                    request.getEmail(), request.getRole(), request.getPassword());
            return ResponseEntity.ok(new LoginResponse(login.getLoginToken(), login.getExpiresAt()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Account created for " + user.getEmail());
        } catch (BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}