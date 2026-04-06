package com.moviebooking.entity;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("MANAGER")
public class Manager extends User {

    // Default constructor (Required by JPA)
    public Manager() {}

    public Manager(String firstName, String lastName, String email, String password) {
        super(firstName, lastName, email, password);
    }

    // Privileged methods
    public void addMovie() {}
    public void deleteMovie() {}
    public void addShowtime() {}
    public void deleteShowtime() {}
}