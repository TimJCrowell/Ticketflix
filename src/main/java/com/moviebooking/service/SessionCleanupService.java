package com.moviebooking.service;

import com.moviebooking.repository.LoginRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Background service that purges expired session tokens from the database.
 *
 * <p>Runs once at startup, then again 3600 seconds after each run completes.
 * Uses a bulk DELETE to avoid loading expired rows into memory.</p>
 */
@Service
public class SessionCleanupService {

    private static final Logger log = LoggerFactory.getLogger(SessionCleanupService.class);

    @Autowired
    private LoginRepository loginRepository;

    /**
     * Deletes all {@code Login} rows whose {@code expiresAt} is in the past,
     * then sleeps for 3600 seconds before the next run.
     */
    @Scheduled(fixedDelay = 3_600_000)
    @Transactional
    public void purgeExpiredSessions() {
        int deleted = loginRepository.deleteExpiredBefore(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Session cleanup: deleted {} expired login(s).", deleted);
        }
    }
}
