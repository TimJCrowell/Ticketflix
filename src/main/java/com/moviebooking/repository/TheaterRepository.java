package com.moviebooking.repository;

import com.moviebooking.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link Theater} entities.
 */
public interface TheaterRepository extends JpaRepository<Theater, Long> {

    boolean existsByName(String name);
}