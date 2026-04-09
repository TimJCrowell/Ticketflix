package com.moviebooking.dto;

import java.time.LocalDateTime;

public class LoginResponse {
    private String token;
    private LocalDateTime expiresAt;

    public LoginResponse(Long token, LocalDateTime expiresAt) {
        this.token = Long.toUnsignedString(token);
        this.expiresAt = expiresAt;
    }

    public String getToken() { return token; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}