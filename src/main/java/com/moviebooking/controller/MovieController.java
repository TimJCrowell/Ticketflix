package com.moviebooking.controller;

import com.moviebooking.dto.MovieRequest;
import com.moviebooking.entity.Movie;
import com.moviebooking.entity.User;
import com.moviebooking.exception.BadRequestException;
import com.moviebooking.exception.NotFoundException;
import com.moviebooking.service.AuthService;
import com.moviebooking.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the movie catalog.
 *
 * <p>Read endpoints are public. Write endpoints ({@code POST}, {@code PUT},
 * {@code DELETE}) require a valid manager session via
 * {@code tf_token} and {@code tf_key} cookies.</p>
 *
 * <pre>
 * GET    /api/movies       — list all movies
 * GET    /api/movies/{id}  — get one movie
 * POST   /api/movies       — create movie (manager)
 * PUT    /api/movies/{id}  — update movie (manager)
 * DELETE /api/movies/{id}  — delete movie (manager)
 * </pre>
 */
@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @Autowired
    private AuthService authService;

    // --- Read (public) ---

    @GetMapping
    public ResponseEntity<List<Movie>> listMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovie(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(movieService.getMovie(id));
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // --- Write (manager only) ---

    /**
     * Creates a new movie.
     *
     * @param request    body containing movie fields
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @PostMapping
    public ResponseEntity<?> createMovie(
            @RequestBody MovieRequest request,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        try {
            Movie movie = movieService.createMovie(
                    request.getName(), request.getRuntime(),
                    request.getShortDescription(), request.getLongDescription(),
                    request.getPosterImage());
            return ResponseEntity.status(HttpStatus.CREATED).body(movie);
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    /**
     * Updates an existing movie.
     *
     * @param id         the movie's Snowflake ID
     * @param request    body containing updated movie fields
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(
            @PathVariable Long id,
            @RequestBody MovieRequest request,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        try {
            Movie movie = movieService.updateMovie(
                    id, request.getName(), request.getRuntime(),
                    request.getShortDescription(), request.getLongDescription(),
                    request.getPosterImage());
            return ResponseEntity.ok(movie);
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    /**
     * Deletes a movie.
     *
     * @param id         the movie's Snowflake ID
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMovie(
            @PathVariable Long id,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        ResponseEntity<?> authError = checkManager(token, sessionKey);
        if (authError != null) return authError;
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok("Movie deleted.");
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
