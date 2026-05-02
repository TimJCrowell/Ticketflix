package com.moviebooking.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.moviebooking.util.SeatmapConverter;
import jakarta.persistence.*;

/**
 * JPA entity representing a screening room within a {@link Theater}.
 *
 * <p>Room numbers are unique per theater (e.g. rooms 1, 2, 3 in "Northridge").
 * The {@code seatmap} is stored as JSON text: an array of row arrays, where each
 * row array holds {@link Seat} objects. Row index 0 = row A, index 1 = row B, etc.
 * Rows may have different lengths.</p>
 */
@Entity
@Table(name = "rooms",
       uniqueConstraints = @UniqueConstraint(columnNames = {"theater_id", "number"}))
public class Room {

    @Id
    @Column(name = "room_id")
    private Long id;

    @Column(name = "number", nullable = false)
    private int number;

    @ManyToOne
    @JoinColumn(name = "theater_id", nullable = false)
    @JsonBackReference
    private Theater theater;

    @Column(name = "seatmap", columnDefinition = "text", nullable = false)
    @Convert(converter = SeatmapConverter.class)
    private Seat[][] seatmap;

    public Room() {}

    public Room(Long id, int number, Theater theater, Seat[][] seatmap) {
        this.id = id;
        this.number = number;
        this.theater = theater;
        this.seatmap = seatmap;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }

    public Theater getTheater() { return theater; }
    public void setTheater(Theater theater) { this.theater = theater; }

    public Seat[][] getSeatmap() { return seatmap; }
    public void setSeatmap(Seat[][] seatmap) { this.seatmap = seatmap; }
}