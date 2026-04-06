package com.moviebooking.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
public class User {

    @Id
    @Column(name = "userid")
    protected Long userID;

    @Column(name = "firstname")
    protected String firstName;

    @Column(name = "lastname")
    protected String lastName;

    @Column(name = "email")
    protected String email;

    protected String password;

    @Column(name = "date_of_birth")
    protected LocalDate dateOfBirth;

    @Column(name = "role", insertable = false, updatable = false)
    protected String role;

    // Default constructor (Required by JPA)
    public User() {}

    // Constructor for logic use
    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    // --- GETTERS AND SETTERS ---

    public Long getUserID() { return userID; }
    public void setUserID(Long userID) { this.userID = userID; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getRole() { return role; }
    // Role is usually handled by the DiscriminatorValue, so we often omit the setter
}