package com.moviebooking.dto;

import java.time.LocalDate;

/**
 * Request body for new account registration.
 *
 * <p>Sent to {@code POST /api/auth/register}. The {@code role} field must be
 * either {@code "CUSTOMER"} or {@code "MANAGER"}.</p>
 */
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role; // "CUSTOMER" or "MANAGER"
    private LocalDate dateOfBirth;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}