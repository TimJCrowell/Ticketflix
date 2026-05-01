package com.moviebooking.repository;
import com.moviebooking.entity.Checkout;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for CRUD access to checkout entities.
 */
public interface CheckoutRepository extends JpaRepository<Checkout, Long>{}