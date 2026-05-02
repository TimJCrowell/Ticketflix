package com.moviebooking.service;

import com.moviebooking.entity.Room;
import com.moviebooking.entity.Seat;
import com.moviebooking.entity.Theater;
import com.moviebooking.exception.BadRequestException;
import com.moviebooking.exception.NotFoundException;
import com.moviebooking.repository.RoomRepository;
import com.moviebooking.repository.TheaterRepository;
import com.moviebooking.util.SnowflakeIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for managing {@link Theater} locations and their {@link Room} instances.
 *
 * <p>All write operations require the caller to have already verified that the
 * acting user holds the {@code MANAGER} role; this service does not re-check
 * authentication.</p>
 */
@Service
public class TheaterService {

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SnowflakeIdGenerator idGenerator;

    /**
     * Returns all theaters with their rooms.
     *
     * @return list of all {@link Theater} entities
     */
    public List<Theater> getAllTheaters() {
        return theaterRepository.findAll();
    }

    /**
     * Returns a single theater by ID.
     *
     * @param id the theater's Snowflake ID
     * @return the matching {@link Theater}
     * @throws NotFoundException if no theater exists with the given ID
     */
    public Theater getTheater(Long id) {
        return theaterRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Theater not found: " + id));
    }

    /**
     * Creates a new theater with the given name.
     *
     * @param name globally unique theater name (e.g. {@code "Northridge"})
     * @return the persisted {@link Theater}
     * @throws BadRequestException if {@code name} is blank
     * @throws RuntimeException    if a theater with that name already exists
     */
    public Theater createTheater(String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Theater name must not be blank");
        }
        if (theaterRepository.existsByName(name)) {
            throw new RuntimeException("A theater named \"" + name + "\" already exists");
        }
        Theater theater = new Theater(idGenerator.nextId(), name);
        return theaterRepository.save(theater);
    }

    /**
     * Deletes a theater and all of its rooms.
     *
     * @param id the theater's Snowflake ID
     * @throws NotFoundException if no theater exists with the given ID
     */
    public void deleteTheater(Long id) {
        if (!theaterRepository.existsById(id)) {
            throw new NotFoundException("Theater not found: " + id);
        }
        theaterRepository.deleteById(id);
    }

    /**
     * Adds a room to a theater.
     *
     * <p>Room numbers must be unique within the theater. The seatmap is a
     * 2-D array of {@link Seat} objects where the outer index is the row
     * (A = 0, B = 1, …) and the inner index is the seat position within
     * that row. Rows may have different lengths.</p>
     *
     * @param theaterId the theater's Snowflake ID
     * @param number    room number, unique within the theater
     * @param seatmap   initial seatmap for the room
     * @return the updated {@link Theater} including the new room
     * @throws NotFoundException   if the theater does not exist
     * @throws BadRequestException if {@code number} is not positive or
     *                             {@code seatmap} is null/empty
     * @throws RuntimeException    if the room number already exists in this theater
     */
    public Theater addRoom(Long theaterId, int number, Seat[][] seatmap) {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new NotFoundException("Theater not found: " + theaterId));
        if (number <= 0) {
            throw new BadRequestException("Room number must be a positive integer");
        }
        if (seatmap == null || seatmap.length == 0) {
            throw new BadRequestException("Seatmap must not be null or empty");
        }
        if (roomRepository.existsByTheaterAndNumber(theater, number)) {
            throw new RuntimeException("Room " + number + " already exists in this theater");
        }
        Room room = new Room(idGenerator.nextId(), number, theater, seatmap);
        roomRepository.save(room);
        return theaterRepository.findById(theaterId).orElseThrow();
    }

    /**
     * Removes a room from a theater.
     *
     * @param theaterId the theater's Snowflake ID
     * @param roomId    the room's Snowflake ID
     * @throws NotFoundException if the theater or room does not exist, or the
     *                           room does not belong to the specified theater
     */
    public void removeRoom(Long theaterId, Long roomId) {
        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new NotFoundException("Theater not found: " + theaterId));
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + roomId));
        if (!room.getTheater().getId().equals(theater.getId())) {
            throw new NotFoundException("Room " + roomId + " does not belong to theater " + theaterId);
        }
        roomRepository.deleteById(roomId);
    }
}