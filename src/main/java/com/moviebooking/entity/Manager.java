package com.moviebooking.entity;

import jakarta.persistence.*;

/**
 * JPA entity representing a manager account.
 *
 * <p>Inherits all user fields from {@link User} and is identified by the
 * {@code "MANAGER"} discriminator value in the {@code users} table.
 * Managers have privileged access to catalogue and showtime operations.</p>
 */
@Entity
@DiscriminatorValue("MANAGER")
public class Manager extends User {

    /** Required by JPA; not intended for direct use. */
    public Manager() {}

    /**
     * Creates a new {@code Manager} with core identity fields.
     *
     * @param firstName manager's first name
     * @param lastName  manager's last name
     * @param email     manager's email address
     * @param password  raw (un-encoded) password
     */
    public Manager(String firstName, String lastName, String email, String password) {
        super(firstName, lastName, email, password);
    }

    // Privileged methods (stubs — to be implemented in a later phase)
    public void addMovie() {}
    public void deleteMovie() {}
    public void addShowtime() {}
    public void deleteShowtime() {}
}