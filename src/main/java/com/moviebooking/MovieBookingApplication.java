package com.moviebooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Ticketflix movie-booking application.
 *
 * <p>Bootstraps the Spring Boot context and starts the embedded web server.</p>
 */
@SpringBootApplication
public class MovieBookingApplication {

    /**
     * Launches the Spring Boot application.
     *
     * @param args command-line arguments passed to the JVM
     */
    public static void main(String[] args) {
        SpringApplication.run(MovieBookingApplication.class, args);
    }
}
