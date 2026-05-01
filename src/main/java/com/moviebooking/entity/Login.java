package com.moviebooking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA entity representing an active login session.
 *
 * <p>Each row in the {@code LOGINS} table records a Snowflake token, the
 * owning {@link User}, the time the session was created, and when it expires.
 * Tokens are valid for {@code TOKEN_EXPIRY_HOURS} hours (defined in
 * {@link com.moviebooking.service.AuthService}).</p>
 */
@Entity
@Table(name = "LOGINS")
public class Login {

    @Id
    @Column(name = "LoginToken")
    private Long loginToken; // Changed to Long for Snowflake

    @Column(name = "LoginTimestamp", nullable = false)
    private LocalDateTime loginTimestamp;

    @Column(name = "ExpiresAt", nullable = false)
    private LocalDateTime expiresAt;

    @ManyToOne
    @JoinColumn(name = "UserID", nullable = false)
    private User user;

    /** Required by JPA; not intended for direct use. */
    public Login() {}

    /**
     * Creates a new {@code Login} session.
     *
     * <p>The {@code loginTimestamp} is set to the current time automatically.</p>
     *
     * @param loginToken Snowflake ID used as the session token
     * @param user       the authenticated user this session belongs to
     * @param expiresAt  date-time after which the session is considered expired
     */
    public Login(Long loginToken, User user, LocalDateTime expiresAt) {
        this.loginToken = loginToken;
        this.user = user;
        this.loginTimestamp = LocalDateTime.now();
        this.expiresAt = expiresAt;
    }

    // --- GETTERS AND SETTERS ---
    public Long getLoginToken() { return loginToken; }
    public void setLoginToken(Long loginToken) { this.loginToken = loginToken; }

    public LocalDateTime getLoginTimestamp() { return loginTimestamp; }
    public void setLoginTimestamp(LocalDateTime loginTimestamp) { this.loginTimestamp = loginTimestamp; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    /**
     * Returns {@code true} if the current time is past this session's expiry.
     *
     * @return {@code true} if expired, {@code false} if still valid
     */
    public boolean isExpired() { return LocalDateTime.now().isAfter(expiresAt); }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}