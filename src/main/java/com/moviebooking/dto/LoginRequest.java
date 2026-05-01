package com.moviebooking.dto;

/**
 * Request body for the password-verification step of the login flow.
 *
 * <p>Sent to {@code POST /api/auth/login/password}.</p>
 */
public class LoginRequest {
    private String email;
    private String role;
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}