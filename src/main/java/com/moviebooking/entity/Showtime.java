package com.moviebooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Represents a scheduled screening of a {@link Movie} in a {@link Room}.
 *
 * <p>The seatmap is copied from the room's {@link SeatSlot} layout at creation
 * time via {@link #fromRoomSeatmap(SeatSlot[][])}. Every present slot becomes a
 * {@link Seat} with {@code available = true}. After that point the showtime's
 * seatmap evolves independently as seats are booked.</p>
 */
@Entity
@Table(name = "showtimes")
public class Showtime {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @Column(name = "showtime_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @Column(name = "datetime", nullable = false)
    private LocalDateTime datetime;

    @Column(name = "movie_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long movieId;

    @Column(name = "room_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long roomId;

    @Column(name = "seatmap", columnDefinition = "text", nullable = false)
    @JsonIgnore
    private String seatmapJson;

    @Transient
    @JsonProperty("seatmap")
    private Seat[][] seatmap;

    public Showtime() {}

    /**
     * Converts a room's physical layout into a showtime seatmap with every
     * present slot set to {@code available = true}.
     *
     * @param roomSeatmap the {@link SeatSlot} grid from the room
     * @return a {@link Seat} grid ready to attach to a new {@link Showtime}
     */
    public static Seat[][] fromRoomSeatmap(SeatSlot[][] roomSeatmap) {
        Seat[][] seats = new Seat[roomSeatmap.length][];
        for (int r = 0; r < roomSeatmap.length; r++) {
            seats[r] = new Seat[roomSeatmap[r].length];
            for (int c = 0; c < roomSeatmap[r].length; c++) {
                SeatSlot slot = roomSeatmap[r][c];
                seats[r][c] = slot != null ? new Seat(true, slot.isAccessible()) : null;
            }
        }
        return seats;
    }

    @PostLoad
    private void loadSeatmap() {
        if (seatmapJson != null) {
            try {
                this.seatmap = MAPPER.readValue(seatmapJson, Seat[][].class);
            } catch (Exception e) {
                throw new RuntimeException("Failed to deserialize showtime seatmap", e);
            }
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDatetime() { return datetime; }
    public void setDatetime(LocalDateTime datetime) { this.datetime = datetime; }

    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public Seat[][] getSeatmap() {
        if (seatmap == null && seatmapJson != null) {
            try {
                seatmap = MAPPER.readValue(seatmapJson, Seat[][].class);
            } catch (Exception e) {
                throw new RuntimeException("Failed to deserialize showtime seatmap", e);
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
                throw new RuntimeException("Failed to serialize showtime seatmap", e);
            }
        }
    }

    public String getSeatmapJson() { return seatmapJson; }
    public void setSeatmapJson(String seatmapJson) {
        this.seatmapJson = seatmapJson;
        loadSeatmap();
    }
}
