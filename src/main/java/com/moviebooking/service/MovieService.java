package com.moviebooking.service;

import com.moviebooking.entity.Movie;
import com.moviebooking.exception.BadRequestException;
import com.moviebooking.exception.NotFoundException;
import com.moviebooking.repository.MovieRepository;
import com.moviebooking.util.SnowflakeIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Service for managing {@link Movie} catalog entries.
 *
 * <p>All write operations require the caller to have already verified that the
 * acting user holds the {@code MANAGER} role; this service does not re-check
 * authentication.</p>
 */
@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private SnowflakeIdGenerator idGenerator;

    @Value("${poster.upload-dir}")
    private String uploadDir;

    /**
     * Returns all movies.
     *
     * @return list of all {@link Movie} entities
     */
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    /**
     * Returns a single movie by ID.
     *
     * @param id the movie's Snowflake ID
     * @return the matching {@link Movie}
     * @throws NotFoundException if no movie exists with the given ID
     */
    public Movie getMovie(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found: " + id));
    }

    /**
     * Creates a new movie.
     *
     * @param name        movie title, must not be blank
     * @param runtime     runtime in minutes, must be positive
     * @param description synopsis (may be {@code null})
     * @param posterImage URL or path to poster image (may be {@code null})
     * @return the persisted {@link Movie}
     * @throws BadRequestException if {@code name} is blank or {@code runtime} is not positive
     * @throws RuntimeException    if a movie with that title already exists
     */
    public Movie createMovie(String name, int runtime, String description,
                             String posterImage, String rating, String genre) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Movie name must not be blank");
        }
        if (runtime <= 0) {
            throw new BadRequestException("Runtime must be a positive number of minutes");
        }
        if (movieRepository.existsByName(name)) {
            throw new RuntimeException("A movie titled \"" + name + "\" already exists");
        }
        Movie movie = new Movie();
        movie.setId(idGenerator.nextId());
        movie.setName(name);
        movie.setRuntime(runtime);
        movie.setDescription(description);
        movie.setPosterImage(posterImage);
        movie.setRating(rating);
        movie.setGenre(genre);
        return movieRepository.save(movie);
    }

    /**
     * Updates an existing movie's fields.
     *
     * @param id          the movie's Snowflake ID
     * @param name        new title, must not be blank
     * @param runtime     new runtime in minutes, must be positive
     * @param description new synopsis (may be {@code null})
     * @param posterImage new poster URL or path (may be {@code null})
     * @return the updated {@link Movie}
     * @throws NotFoundException   if no movie exists with the given ID
     * @throws BadRequestException if {@code name} is blank or {@code runtime} is not positive
     * @throws RuntimeException    if the new title is already taken by a different movie
     */
    public Movie updateMovie(Long id, String name, int runtime, String description,
                             String posterImage, String rating, String genre) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found: " + id));
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Movie name must not be blank");
        }
        if (runtime <= 0) {
            throw new BadRequestException("Runtime must be a positive number of minutes");
        }
        if (!movie.getName().equals(name) && movieRepository.existsByName(name)) {
            throw new RuntimeException("A movie titled \"" + name + "\" already exists");
        }
        movie.setName(name);
        movie.setRuntime(runtime);
        movie.setDescription(description);
        movie.setPosterImage(posterImage);
        movie.setRating(rating);
        movie.setGenre(genre);
        return movieRepository.save(movie);
    }

    /**
     * Saves an uploaded poster image for a movie.
     *
     * <p>The file is written to the configured upload directory as
     * {@code {movieId as unsigned decimal}.{ext}} and {@code posterImage} is
     * updated to {@code /img/posters/{filename}}.</p>
     *
     * @param movieId the movie's Snowflake ID
     * @param file    the uploaded image file
     * @return the updated {@link Movie}
     * @throws NotFoundException if no movie exists with the given ID
     * @throws IOException       if the file cannot be written to disk
     */
    public Movie uploadPoster(Long movieId, MultipartFile file) throws IOException {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new NotFoundException("Movie not found: " + movieId));

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.'))
                : "";

        String filename = Long.toUnsignedString(movieId) + ext;
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        file.transferTo(dir.resolve(filename));

        Path targetDir = Paths.get("target/classes/static/img/posters");
        if (!targetDir.equals(dir)) {
            Files.createDirectories(targetDir);
            Files.copy(dir.resolve(filename), targetDir.resolve(filename),
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }

        movie.setPosterImage("/img/posters/" + filename);
        return movieRepository.save(movie);
    }

    /**
     * Deletes a movie.
     *
     * @param id the movie's Snowflake ID
     * @throws NotFoundException if no movie exists with the given ID
     */
    public void deleteMovie(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new NotFoundException("Movie not found: " + id);
        }
        movieRepository.deleteById(id);
    }
}
