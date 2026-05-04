package com.moviebooking.entity;

import jakarta.persistence.*;

/**
 * Represents a single booked seat within a {@link Showtime}, issued as part
 * of a checkout.
 */
@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @Column(name = "ticket_id")
    private Long id;

    @Column(name = "showtime_id", nullable = false)
    private Long showtimeId;

    @Column(name = "checkout_id", nullable = false)
    private Long checkoutId;

    @Column(name = "seat_row", nullable = false)
    private int seatRow;

    @Column(name = "seat_col", nullable = false)
    private int seatCol;

    public Ticket() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }

    public Long getCheckoutId() { return checkoutId; }
    public void setCheckoutId(Long checkoutId) { this.checkoutId = checkoutId; }

    public int getSeatRow() { return seatRow; }
    public void setSeatRow(int seatRow) { this.seatRow = seatRow; }

    public int getSeatCol() { return seatCol; }
    public void setSeatCol(int seatCol) { this.seatCol = seatCol; }
}
