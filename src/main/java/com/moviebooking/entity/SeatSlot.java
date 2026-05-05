package com.moviebooking.entity;

/**
 * Represents a seat position in a {@link Room}'s physical layout.
 *
 * <p>Stores only static properties of the seat. Availability state is not
 * tracked here; it lives on the per-showtime {@link Seat} copied from this
 * layout at showtime creation.</p>
 *
 * <p>A {@code null} entry in the seatmap grid means no seat exists at that
 * position (e.g. an aisle or irregular row).</p>
 */
public class SeatSlot {

    private boolean accessible;

    public SeatSlot() {}

    public SeatSlot(boolean accessible) {
        this.accessible = accessible;
    }

    public boolean isAccessible() { return accessible; }
    public void setAccessible(boolean accessible) { this.accessible = accessible; }
}
