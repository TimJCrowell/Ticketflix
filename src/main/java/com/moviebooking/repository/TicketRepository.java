package com.moviebooking.repository;

import com.moviebooking.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCheckoutId(Long checkoutId);
    List<Ticket> findByShowtimeId(Long showtimeId);
}
