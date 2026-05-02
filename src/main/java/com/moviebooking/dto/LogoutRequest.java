package com.moviebooking.dto;

/**
 * Request body for {@code POST /api/auth/logout}.
 */
public class LogoutRequest {
    private String token;
    private String rawKey;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRawKey() { return rawKey; }
    public void setRawKey(String rawKey) { this.rawKey = rawKey; }
}