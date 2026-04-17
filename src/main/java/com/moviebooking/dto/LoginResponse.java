package com.moviebooking.dto;

import java.time.LocalDateTime;

/**
 * Response body returned after a successful login.
 *
 * <p>The token is the unsigned decimal string representation of the Snowflake
 * ID used as the session key.</p>
 */
public class LoginResponse {
    private String token;
    private LocalDateTime expiresAt;

    /**
     * Constructs a login response.
     *
     * @param token     the Snowflake session token (converted to unsigned decimal string)
     * @param expiresAt the date-time when this session expires
     */
    public LoginResponse(Long token, LocalDateTime expiresAt) {
        this.token = Long.toUnsignedString(token);
        this.expiresAt = expiresAt;
    }

    public String getToken() { return token; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}