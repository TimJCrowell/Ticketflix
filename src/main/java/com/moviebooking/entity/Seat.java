package com.moviebooking.entity;

/**
 * Represents a single seat within a {@link Room} seatmap.
 *
 * <p>{@code available} is nullable: {@code null} means the seat state is unknown
 * or not yet set; {@code true} means available for booking; {@code false} means
 * taken or blocked. {@code accessible} indicates a wheelchair-accessible seat.</p>
 */
public class Seat {

    private Boolean available; // nullable
    private boolean accessible;

    public Seat() {}

    public Seat(Boolean available, boolean accessible) {
        this.available = available;
        this.accessible = accessible;
    }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public boolean isAccessible() { return accessible; }
    public void setAccessible(boolean accessible) { this.accessible = accessible; }
}