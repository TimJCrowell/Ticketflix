package com.moviebooking.controller;

import com.moviebooking.dto.ShowtimeRequest;
import com.moviebooking.entity.Showtime;
import com.moviebooking.entity.User;
import com.moviebooking.exception.BadRequestException;
import com.moviebooking.exception.NotFoundException;
import com.moviebooking.service.AuthService;
import com.moviebooking.service.ShowtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for showtime scheduling.
 *
 * <p>Read endpoints are public. Write endpoints ({@code POST}, {@code PUT},
 * {@code DELETE}) require a valid manager session via
 * {@code tf_token} and {@code tf_key} cookies.</p>
 *
 * <pre>
 * GET    /api/showtimes              — list all showtimes (optional ?movieId= or ?roomId=)
 * GET    /api/showtimes/{id}         — get one showtime with seatmap
 * POST   /api/showtimes              — create showtime (manager)
 * PUT    /api/showtimes/{id}         — update showtime (manager)
 * DELETE /api/showtimes/{id}         — delete showtime (manager)
 * </pre>
 */
@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    @Autowired
    private ShowtimeService showtimeService;

    @Autowired
    private AuthService authService;

    // --- Read (public) ---

    @GetMapping
    public ResponseEntity<List<Showtime>> listShowtimes(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long roomId) {
        return ResponseEntity.ok(showtimeService.getShowtimes(movieId, roomId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShowtime(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(showtimeService.getShowtime(id));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // --- Write (manager only) ---

    /**
     * Schedules a new showtime. Copies the room's seatmap at creation time.
     *
     * @param request    body containing movieId, roomId, and datetime
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @PostMapping
    public ResponseEntity<?> createShowtime(
            @RequestBody ShowtimeRequest request,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        Long movieId, roomId;
        try {
            movieId = Long.parseUnsignedLong(request.getMovieId());
            roomId  = Long.parseUnsignedLong(request.getRoomId());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid movieId or roomId");
        }
        try {
            Showtime showtime = showtimeService.createShowtime(movieId, roomId, request.getDatetime());
            return ResponseEntity.status(HttpStatus.CREATED).body(showtime);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Updates an existing showtime. If the room changes, the seatmap is re-copied.
     *
     * @param id         the showtime's Snowflake ID
     * @param request    body containing updated movieId, roomId, and datetime
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateShowtime(
            @PathVariable Long id,
            @RequestBody ShowtimeRequest request,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        Long movieId, roomId;
        try {
            movieId = Long.parseUnsignedLong(request.getMovieId());
            roomId  = Long.parseUnsignedLong(request.getRoomId());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid movieId or roomId");
        }
        try {
            Showtime showtime = showtimeService.updateShowtime(id, movieId, roomId, request.getDatetime());
            return ResponseEntity.ok(showtime);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Deletes a showtime.
     *
     * @param id         the showtime's Snowflake ID
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShowtime(
            @PathVariable Long id,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        try {
            showtimeService.deleteShowtime(id);
            return ResponseEntity.ok("Showtime deleted.");
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
