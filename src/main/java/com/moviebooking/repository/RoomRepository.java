package com.moviebooking.repository;

import com.moviebooking.entity.Room;
import com.moviebooking.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link Room} entities.
 */
public interface RoomRepository extends JpaRepository<Room, Long> {

    boolean existsByTheaterAndNumber(Theater theater, int number);
}