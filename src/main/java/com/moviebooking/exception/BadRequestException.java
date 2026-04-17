package com.moviebooking.exception;

/**
 * Thrown when a request contains semantically invalid data (maps to HTTP 400).
 *
 * <p>Distinct from a {@link RuntimeException} that maps to HTTP 409 (conflict);
 * use this when the input itself is malformed or violates a business rule
 * independent of existing data (e.g. an unrecognised role value).</p>
 */
public class BadRequestException extends RuntimeException {

    /**
     * Creates a new {@code BadRequestException} with the given message.
     *
     * @param message human-readable description of what was invalid
     */
    public BadRequestException(String message) {
        super(message);
    }
}