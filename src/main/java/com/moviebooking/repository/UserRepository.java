package com.moviebooking.repository;

import com.moviebooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entities.
 *
 * <p>Provides custom JPQL queries to support the two-step login flow
 * (email lookup followed by role-specific password verification).</p>
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Returns all roles registered to the given email address.
     *
     * <p>Used in step 1 of login to determine which role-selection options
     * to present to the user (or to skip the screen when only one role exists).</p>
     *
     * @param email the email address to look up
     * @return list of role strings (e.g. {@code ["CUSTOMER", "MANAGER"]}),
     *         empty if no account exists for that email
     */
    @Query("SELECT u.role FROM User u WHERE u.email = :email")
    List<String> findRolesByEmail(@Param("email") String email);

    /**
     * Looks up a user by email and role.
     *
     * @param email the user's email address
     * @param role  the discriminator role value (e.g. {@code "CUSTOMER"})
     * @return an {@link Optional} containing the matching user, or empty if not found
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.role = :role")
    Optional<User> findByEmailAndRole(@Param("email") String email, @Param("role") String role);

    /**
     * Checks whether an account already exists for the given email and role combination.
     *
     * <p>Used during registration to prevent duplicate accounts.</p>
     *
     * @param email the email address to check
     * @param role  the role to check
     * @return {@code true} if an account already exists, {@code false} otherwise
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.role = :role")
    boolean existsByEmailAndRole(@Param("email") String email, @Param("role") String role);
}