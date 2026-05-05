package com.moviebooking.dto;

import java.time.LocalDateTime;
import java.util.Base64;

/**
 * Response body returned after a successful login.
 *
 * <p>{@code token} is the unsigned decimal Snowflake session ID. {@code rawKey}
 * is the Base64-encoded 32-byte HMAC key that the browser must store and supply
 * on every subsequent authenticated request; the server stores only the HMAC,
 * never the raw key.</p>
 */
public class LoginResponse {
    private String token;
    private String rawKey;
    private LocalDateTime expiresAt;

    /**
     * Constructs a login response.
     *
     * @param token     the Snowflake session token (converted to unsigned decimal string)
     * @param rawKey    the raw 32-byte HMAC key to be stored by the browser
     * @param expiresAt the date-time when this session expires
     */
    public LoginResponse(Long token, byte[] rawKey, LocalDateTime expiresAt) {
        this.token = Long.toUnsignedString(token);
        this.rawKey = Base64.getEncoder().encodeToString(rawKey);
        this.expiresAt = expiresAt;
    }

    public String getToken() { return token; }
    public String getRawKey() { return rawKey; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}