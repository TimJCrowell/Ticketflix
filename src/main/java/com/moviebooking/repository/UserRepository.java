package com.moviebooking.repository;

import com.moviebooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT u.role FROM User u WHERE u.email = :email")
    List<String> findRolesByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.role = :role")
    Optional<User> findByEmailAndRole(@Param("email") String email, @Param("role") String role);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.role = :role")
    boolean existsByEmailAndRole(@Param("email") String email, @Param("role") String role);
}