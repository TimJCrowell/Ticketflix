package com.moviebooking.controller;

import com.moviebooking.dto.RoomRequest;
import com.moviebooking.dto.TheaterRequest;
import com.moviebooking.entity.SeatSlot;
import com.moviebooking.entity.Theater;
import com.moviebooking.entity.User;
import com.moviebooking.exception.BadRequestException;
import com.moviebooking.exception.NotFoundException;
import com.moviebooking.service.AuthService;
import com.moviebooking.service.TheaterService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for theater and room management.
 *
 * <p>Read endpoints are public. Write endpoints ({@code POST}, {@code DELETE})
 * require a valid manager session via {@code tf_token} and {@code tf_key} cookies.</p>
 *
 * <pre>
 * GET    /api/theaters                                  — list all theaters
 * GET    /api/theaters/{id}                             — get one theater with rooms
 * POST   /api/theaters                                  — create theater (manager)
 * DELETE /api/theaters/{id}                             — delete theater (manager)
 * POST   /api/theaters/{id}/rooms                       — add room (manager)
 * GET    /api/theaters/{id}/rooms/{roomId}/seatmap      — get room seatmap (manager)
 * PUT    /api/theaters/{id}/rooms/{roomId}/seatmap      — replace room seatmap (manager)
 * DELETE /api/theaters/{id}/rooms/{roomId}              — remove room (manager)
 * </pre>
 */
@RestController
@RequestMapping("/api/theaters")
public class TheaterController {

    private static final Logger log = LoggerFactory.getLogger(TheaterController.class);

    @Autowired
    private TheaterService theaterService;

    @Autowired
    private AuthService authService;

    // --- Read (public) ---

    @GetMapping
    public ResponseEntity<List<Theater>> listTheaters() {
        return ResponseEntity.ok(theaterService.getAllTheaters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTheater(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(theaterService.getTheater(id));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // --- Write (manager only) ---

    /**
     * Creates a new theater.
     *
     * @param request    body containing the unique theater name
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @PostMapping
    public ResponseEntity<?> createTheater(
            @RequestBody TheaterRequest request,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        try {
            Theater theater = theaterService.createTheater(request.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(theater);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    /**
     * Deletes a theater and all of its rooms.
     *
     * @param id         the theater's Snowflake ID
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTheater(
            @PathVariable Long id,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        try {
            theaterService.deleteTheater(id);
            return ResponseEntity.ok("Theater deleted.");
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Adds a room to a theater.
     *
     * @param id         the theater's Snowflake ID
     * @param request    body containing the room number and seatmap
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @PostMapping("/{id}/rooms")
    public ResponseEntity<?> addRoom(
            @PathVariable Long id,
            @RequestBody RoomRequest request,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        try {
            Theater theater = theaterService.addRoom(id, request.getNumber(), request.getSeatmap());
            return ResponseEntity.status(HttpStatus.CREATED).body(theater);
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            log.error("addRoom failed", e);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    /**
     * Returns the seatmap for a room.
     *
     * @param id         the theater's Snowflake ID
     * @param roomId     the room's Snowflake ID
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @GetMapping("/{id}/rooms/{roomId}/seatmap")
    public ResponseEntity<?> getRoomSeatmap(
            @PathVariable Long id,
            @PathVariable Long roomId,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        try {
            return ResponseEntity.ok(theaterService.getRoomSeatmap(id, roomId));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Replaces the seatmap for a room.
     *
     * <p>The request body is a 2-D array of {@link SeatSlot} objects. A {@code null}
     * entry means no seat at that grid position. Existing showtimes are unaffected;
     * their seatmaps were copied at creation time and evolve independently.</p>
     *
     * @param id         the theater's Snowflake ID
     * @param roomId     the room's Snowflake ID
     * @param seatmap    replacement seatmap
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @PutMapping("/{id}/rooms/{roomId}/seatmap")
    public ResponseEntity<?> updateRoomSeatmap(
            @PathVariable Long id,
            @PathVariable Long roomId,
            @RequestBody SeatSlot[][] seatmap,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        try {
            return ResponseEntity.ok(theaterService.updateRoomSeatmap(id, roomId, seatmap));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Removes a room from a theater.
     *
     * @param id         the theater's Snowflake ID
     * @param roomId     the room's Snowflake ID
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @DeleteMapping("/{id}/rooms/{roomId}")
    public ResponseEntity<?> removeRoom(
            @PathVariable Long id,
            @PathVariable Long roomId,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        try {
            theaterService.removeRoom(id, roomId);
            return ResponseEntity.ok("Room deleted.");
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Validates the bearer token + session key and confirms the user is a MANAGER.
     *
     * @return {@code null} if auth is valid; a {@link ResponseEntity} error
     *         (401 or 403) to return immediately if auth fails
     */
    private ResponseEntity<?> checkManager(String token, String sessionKey) {
        if (token == null || token.isBlank() || sessionKey == null || sessionKey.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        User user;
        try {
            user = authService.validateToken(token, sessionKey);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (!"MANAGER".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Manager role required");
        }
        return null;
    }
}
