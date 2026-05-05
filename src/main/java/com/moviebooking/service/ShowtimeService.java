package com.moviebooking.service;

import com.moviebooking.entity.Room;
import com.moviebooking.entity.Showtime;
import com.moviebooking.exception.BadRequestException;
import com.moviebooking.exception.NotFoundException;
import com.moviebooking.repository.MovieRepository;
import com.moviebooking.repository.RoomRepository;
import com.moviebooking.repository.ShowtimeRepository;
import com.moviebooking.util.SnowflakeIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * Service for managing {@link Showtime} scheduling.
 *
 * <p>All write operations require the caller to have already verified that the
 * acting user holds the {@code MANAGER} role; this service does not re-check
 * authentication.</p>
 *
 * <p>When a showtime is created, the room's current {@link com.moviebooking.entity.SeatSlot}
 * layout is deep-copied into a {@link com.moviebooking.entity.Seat} grid on the showtime.
 * Subsequent changes to the room layout do not affect existing showtimes.</p>
 */
@Service
public class ShowtimeService {

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SnowflakeIdGenerator idGenerator;

    /**
     * Returns all showtimes, optionally filtered by movie or room.
     *
     * @param movieId filter to showtimes for this movie (may be {@code null})
     * @param roomId  filter to showtimes in this room (may be {@code null})
     * @return matching {@link Showtime} list
     */
    public List<Showtime> getShowtimes(Long movieId, Long roomId) {
        if (movieId != null) return showtimeRepository.findByMovieId(movieId);
        if (roomId != null)  return showtimeRepository.findByRoomId(roomId);
        return showtimeRepository.findAll();
    }

    /**
     * Returns a single showtime by ID.
     *
     * @param id the showtime's Snowflake ID
     * @return the matching {@link Showtime}
     * @throws NotFoundException if no showtime exists with the given ID
     */
    public Showtime getShowtime(Long id) {
        return showtimeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Showtime not found: " + id));
    }

    /**
     * Schedules a new showtime and copies the room's current seatmap.
     *
     * @param movieId      Snowflake ID of the movie to screen
     * @param roomId       Snowflake ID of the room to use
     * @param datetimeStr  ISO-8601 datetime string, e.g. {@code "2025-07-04T19:30:00"}
     * @return the persisted {@link Showtime}
     * @throws BadRequestException if any parameter is missing/invalid or the datetime is in the past
     * @throws NotFoundException   if the movie or room does not exist
     */
    public Showtime createShowtime(Long movieId, Long roomId, String datetimeStr) {
        LocalDateTime datetime = parseAndValidateDatetime(datetimeStr);
        validateMovieExists(movieId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + roomId));

        Showtime showtime = new Showtime();
        showtime.setId(idGenerator.nextId());
        showtime.setMovieId(movieId);
        showtime.setRoomId(roomId);
        showtime.setDatetime(datetime);
        showtime.setSeatmap(Showtime.fromRoomSeatmap(room.getSeatmap()));
        return showtimeRepository.save(showtime);
    }

    /**
     * Updates an existing showtime's scheduling fields.
     *
     * <p>If {@code roomId} changes, the seatmap is re-copied from the new room.</p>
     *
     * @param id           the showtime's Snowflake ID
     * @param movieId      new movie Snowflake ID
     * @param roomId       new room Snowflake ID
     * @param datetimeStr  new ISO-8601 datetime string
     * @return the updated {@link Showtime}
     * @throws NotFoundException   if the showtime, movie, or room does not exist
     * @throws BadRequestException if any parameter is missing/invalid or the datetime is in the past
     */
    public Showtime updateShowtime(Long id, Long movieId, Long roomId, String datetimeStr) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Showtime not found: " + id));
        LocalDateTime datetime = parseAndValidateDatetime(datetimeStr);
        validateMovieExists(movieId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + roomId));

        showtime.setMovieId(movieId);
        showtime.setDatetime(datetime);
        if (!roomId.equals(showtime.getRoomId())) {
            showtime.setRoomId(roomId);
            showtime.setSeatmap(Showtime.fromRoomSeatmap(room.getSeatmap()));
        }
        return showtimeRepository.save(showtime);
    }

    /**
     * Deletes a showtime.
     *
     * @param id the showtime's Snowflake ID
     * @throws NotFoundException if no showtime exists with the given ID
     */
    public void deleteShowtime(Long id) {
        if (!showtimeRepository.existsById(id)) {
            throw new NotFoundException("Showtime not found: " + id);
        }
        showtimeRepository.deleteById(id);
    }

    private LocalDateTime parseAndValidateDatetime(String datetimeStr) {
        if (datetimeStr == null || datetimeStr.isBlank()) {
            throw new BadRequestException("Datetime must not be blank");
        }
        try {
            return LocalDateTime.parse(datetimeStr);
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Datetime must be ISO-8601 format, e.g. \"2025-07-04T19:30:00\"");
        }
    }

    private void validateMovieExists(Long movieId) {
        if (movieId == null) {
            throw new BadRequestException("movieId is required");
        }
        if (!movieRepository.existsById(movieId)) {
            throw new NotFoundException("Movie not found: " + movieId);
        }
    }
}
