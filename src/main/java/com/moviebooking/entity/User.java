package com.moviebooking.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Base JPA entity representing an application user.
 *
 * <p>Stored in the {@code users} table using a single-table inheritance strategy.
 * The {@code role} discriminator column distinguishes between subclasses
 * ({@link Customer}, {@link Manager}).</p>
 */
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

    /** Required by JPA; not intended for direct use. */
    public User() {}

    /**
     * Creates a new {@code User} with core identity fields.
     *
     * <p>The password supplied here should be the raw value; callers are
     * responsible for encoding it before persisting.</p>
     *
     * @param firstName user's first name
     * @param lastName  user's last name
     * @param email     user's email address (used as login identifier)
     * @param password  raw (un-encoded) password
     */
    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    // --- GETTERS AND SETTERS ---

    /** @return the Snowflake-generated user ID */
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