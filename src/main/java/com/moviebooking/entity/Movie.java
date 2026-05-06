package com.moviebooking.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.*;

/**
 * Represents a movie that can be scheduled for screenings.
 */
@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @Column(name = "movie_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "runtime_minutes", nullable = false)
    private int runtime;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "poster_image")
    private String posterImage;

    @Column(name = "rating")
    private String rating;

    @Column(name = "genre")
    private String genre;

    public Movie() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getRuntime() { return runtime; }
    public void setRuntime(int runtime) { this.runtime = runtime; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPosterImage() { return posterImage; }
    public void setPosterImage(String posterImage) { this.posterImage = posterImage; }

    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
}
