package com.moviebooking.dto;

/**
 * Request body for creating or updating a showtime.
 *
 * <p>{@code datetime} must be an ISO-8601 local datetime string, e.g.
 * {@code "2025-07-04T19:30:00"}.</p>
 */
public class ShowtimeRequest {

    private String movieId;
    private String roomId;
    private String datetime;

    public String getMovieId() { return movieId; }
    public void setMovieId(String movieId) { this.movieId = movieId; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getDatetime() { return datetime; }
    public void setDatetime(String datetime) { this.datetime = datetime; }
}
