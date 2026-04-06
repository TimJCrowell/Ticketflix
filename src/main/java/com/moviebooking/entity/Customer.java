package com.moviebooking.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("CUSTOMER")
public class Customer extends User {

    // Default constructor (Required by JPA)
    public Customer() {}

    public Customer(String firstName, String lastName, String email, String password) {
        super(firstName, lastName, email, password);
    }
}