package com.moviebooking.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    private static final ObjectMapper MAPPER = new ObjectMapper();

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
    @JsonIgnore
    private String seatmapJson;

    @Transient
    @JsonProperty("seatmap")
    private Seat[][] seatmap;

    public Room() {}

    public Room(Long id, int number, Theater theater, Seat[][] seatmap) {
        this.id = id;
        this.number = number;
        this.theater = theater;
        setSeatmap(seatmap);
    }

    @PostLoad
    private void loadSeatmap() {
        if (seatmapJson != null) {
            try {
                this.seatmap = MAPPER.readValue(seatmapJson, Seat[][].class);
            } catch (Exception e) {
                throw new RuntimeException("Failed to deserialize seatmap", e);
            }
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }

    public Theater getTheater() { return theater; }
    public void setTheater(Theater theater) { this.theater = theater; }

    public Seat[][] getSeatmap() {
        if (seatmap == null && seatmapJson != null) {
            try {
                seatmap = MAPPER.readValue(seatmapJson, Seat[][].class);
            } catch (Exception e) {
                throw new RuntimeException("Failed to deserialize seatmap", e);
            }
        }
        return seatmap;
    }

    public void setSeatmap(Seat[][] seatmap) {
        this.seatmap = seatmap;
        if (seatmap != null) {
            try {
                this.seatmapJson = MAPPER.writeValueAsString(seatmap);
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize seatmap", e);
            }
        }
    }

    public String getSeatmapJson() { return seatmapJson; }
    public void setSeatmapJson(String seatmapJson) {
        this.seatmapJson = seatmapJson;
        loadSeatmap();
    }
}