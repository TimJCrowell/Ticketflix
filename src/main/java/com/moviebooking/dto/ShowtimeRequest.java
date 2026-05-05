package com.moviebooking.dto;

/**
 * Request body for creating or updating a showtime.
 *
 * <p>{@code datetime} must be an ISO-8601 local datetime string, e.g.
 * {@code "2025-07-04T19:30:00"}.</p>
 */
public class ShowtimeRequest {

    private Long movieId;
    private Long roomId;
    private String datetime;

    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getDatetime() { return datetime; }
    public void setDatetime(String datetime) { this.datetime = datetime; }
}
