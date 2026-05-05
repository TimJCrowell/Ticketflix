package com.moviebooking.repository;
import com.moviebooking.entity.Checkout;
import com.moviebooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository interface for CRUD access to checkout entities.
 */
public interface CheckoutRepository extends JpaRepository<Checkout, Long> {
    List<Checkout> findByUser(User user);
    List<Checkout> findByShowtimeId(Long showtimeId);
}