package com.moviebokking.reporsitory;
import com.moviebooking.entity.Checkout;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckoutRepository extends JpaRepository<Checkout, Long>{}