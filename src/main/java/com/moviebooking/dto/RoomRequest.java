package com.moviebooking.dto;

import com.moviebooking.entity.Seat;

/**
 * Request body for adding a room to a theater.
 *
 * <p>{@code seatmap} is a 2-D array of {@link Seat} objects: the outer array
 * represents rows (index 0 = row A, index 1 = row B, …) and each inner array
 * represents the seats within that row. Rows may have different lengths.</p>
 */
public class RoomRequest {
    private int number;
    private Seat[][] seatmap;

    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }

    public Seat[][] getSeatmap() { return seatmap; }
    public void setSeatmap(Seat[][] seatmap) { this.seatmap = seatmap; }
}