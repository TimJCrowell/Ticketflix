package com.moviebooking.dto;

/**
 * Request body for creating a theater.
 */
public class TheaterRequest {
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}