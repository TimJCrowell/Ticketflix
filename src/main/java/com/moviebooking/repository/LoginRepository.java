package com.moviebooking.repository;

import com.moviebooking.entity.Login;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link Login} session entities.
 *
 * <p>Inherits standard CRUD operations from {@link JpaRepository}.
 * Sessions are keyed by their Snowflake token ({@code Long}).</p>
 */
public interface LoginRepository extends JpaRepository<Login, Long> {
}