package com.moviebooking.repository;

import com.moviebooking.entity.Login;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

/**
 * Spring Data JPA repository for {@link Login} session entities.
 *
 * <p>Inherits standard CRUD operations from {@link JpaRepository}.
 * Sessions are keyed by their Snowflake token ({@code Long}).</p>
 */
public interface LoginRepository extends JpaRepository<Login, Long> {

    /**
     * Bulk-deletes all sessions whose expiry is before {@code cutoff}.
     *
     * @param cutoff sessions expiring before this timestamp are removed
     * @return the number of rows deleted
     */
    @Modifying
    @Query("DELETE FROM Login l WHERE l.expiresAt < :cutoff")
    int deleteExpiredBefore(@Param("cutoff") LocalDateTime cutoff);
}