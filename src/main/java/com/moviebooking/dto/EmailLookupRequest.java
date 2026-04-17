package com.moviebooking.dto;

/**
 * Request body for the email-lookup step of the login flow.
 *
 * <p>Sent to {@code POST /api/auth/login/email}.</p>
 */
public class EmailLookupRequest {
    private String email;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}