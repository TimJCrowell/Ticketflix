package com.moviebooking.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity representing a theater location.
 *
 * <p>Theater names are globally unique (e.g. "Northridge"). Each theater owns
 * zero or more {@link Room} instances. Deleting a theater cascades to all its rooms.</p>
 */
@Entity
@Table(name = "theaters")
public class Theater {

    @Id
    @Column(name = "theater_id")
    private Long id;

    @Column(name = "name", unique = true, nullable = false)
    private String name;

    @OneToMany(mappedBy = "theater", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Room> rooms = new ArrayList<>();

    public Theater() {}

    public Theater(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Room> getRooms() { return rooms; }
    public void setRooms(List<Room> rooms) { this.rooms = rooms; }
}