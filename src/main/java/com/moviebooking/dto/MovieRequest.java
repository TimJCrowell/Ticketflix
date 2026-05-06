package com.moviebooking.dto;

/**
 * Request body for creating or updating a movie.
 */
public class MovieRequest {

    private String name;
    private int runtime;
    private String shortDescription;
    private String longDescription;
    private String posterImage;
    private String rating;
    private String genre;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getRuntime() { return runtime; }
    public void setRuntime(int runtime) { this.runtime = runtime; }

    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }

    public String getLongDescription() { return longDescription; }
    public void setLongDescription(String longDescription) { this.longDescription = longDescription; }

    public String getPosterImage() { return posterImage; }
    public void setPosterImage(String posterImage) { this.posterImage = posterImage; }

    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
}
