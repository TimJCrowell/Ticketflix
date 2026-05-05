package com.moviebooking.dto;

import com.moviebooking.entity.SeatSlot;

/**
 * Request body for adding a room to a theater.
 *
 * <p>{@code seatmap} is a 2-D array of {@link SeatSlot} objects describing the
 * physical layout: the outer array represents rows (index 0 = row A, index 1 =
 * row B, …) and each inner array represents the seat positions within that row.
 * Rows may have different lengths. A {@code null} entry means no seat at that
 * grid position. If omitted, the server applies a default 8 × 14 layout.</p>
 */
public class RoomRequest {
    private int number;
    private SeatSlot[][] seatmap;

    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }

    public SeatSlot[][] getSeatmap() { return seatmap; }
    public void setSeatmap(SeatSlot[][] seatmap) { this.seatmap = seatmap; }
}
