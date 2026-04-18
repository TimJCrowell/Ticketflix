package com.moviebooking.entity;

import jakarta.persistence.*;

/**
 * JPA entity representing a customer account.
 *
 * <p>Inherits all user fields from {@link User} and is identified by the
 * {@code "CUSTOMER"} discriminator value in the {@code users} table.</p>
 */
@Entity
@DiscriminatorValue("CUSTOMER")
public class Customer extends User {

    /** Required by JPA; not intended for direct use. */
    public Customer() {}

    /**
     * Creates a new {@code Customer} with core identity fields.
     *
     * @param firstName customer's first name
     * @param lastName  customer's last name
     * @param email     customer's email address
     * @param password  raw (un-encoded) password
     */
    public Customer(String firstName, String lastName, String email, String password) {
        super(firstName, lastName, email, password);
    }
}