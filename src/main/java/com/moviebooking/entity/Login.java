package com.moviebooking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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

    public Login() {}

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

    public boolean isExpired() { return LocalDateTime.now().isAfter(expiresAt); }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}