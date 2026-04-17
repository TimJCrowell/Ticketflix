package com.moviebooking.util;

import org.springframework.stereotype.Component;

/**
 * Generates globally unique 64-bit IDs using a Snowflake-style algorithm.
 *
 * <p>Based on Discord's Snowflake design (itself derived from Twitter's).
 * Each ID encodes a millisecond timestamp relative to a custom epoch
 * (Jan 1 2026), a datacenter ID, a worker ID, and a per-millisecond sequence
 * number — guaranteeing uniqueness without a central counter.</p>
 *
 * <p>Bit layout (MSB → LSB):</p>
 * <pre>
 *   [41 bits: ms since epoch] [5 bits: datacenter] [5 bits: worker] [12 bits: sequence]
 * </pre>
 */
@Component
public class SnowflakeIdGenerator {
    private final long epoch = 1767225600000L; // Custom epoch (Jan 1, 2026)
    private final long workerIdBits = 5L;
    private final long datacenterIdBits = 5L;
    private final long maxWorkerId = -1L ^ (-1L << workerIdBits);
    private final long maxDatacenterId = -1L ^ (-1L << datacenterIdBits);
    private final long sequenceBits = 12L;

    private final long workerIdShift = sequenceBits;
    private final long datacenterIdShift = sequenceBits + workerIdBits;
    private final long timestampLeftShift = sequenceBits + workerIdBits + datacenterIdBits;
    private final long sequenceMask = -1L ^ (-1L << sequenceBits);

    private long workerId = 1; // Default for local dev
    private long datacenterId = 1; // Default for local dev
    private long sequence = 0L;
    private long lastTimestamp = -1L;

    /**
     * Generates the next unique Snowflake ID.
     *
     * <p>Thread-safe: the method is {@code synchronized} to ensure the sequence
     * counter and last-timestamp state are updated atomically.</p>
     *
     * @return a unique 64-bit ID
     * @throws RuntimeException if the system clock moves backwards
     */
    public synchronized long nextId() {
        long timestamp = timeGen();

        if (timestamp < lastTimestamp) {
            throw new RuntimeException("Clock moved backwards.");
        }

        if (lastTimestamp == timestamp) {
            sequence = (sequence + 1) & sequenceMask;
            if (sequence == 0) {
                timestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }

        lastTimestamp = timestamp;

        return ((timestamp - epoch) << timestampLeftShift)
                | (datacenterId << datacenterIdShift)
                | (workerId << workerIdShift)
                | sequence;
    }

    /**
     * Busy-waits until the system clock advances past {@code lastTimestamp}.
     *
     * @param lastTimestamp the timestamp (ms) to wait beyond
     * @return the first millisecond strictly greater than {@code lastTimestamp}
     */
    private long tilNextMillis(long lastTimestamp) {
        long timestamp = timeGen();
        while (timestamp <= lastTimestamp) {
            timestamp = timeGen();
        }
        return timestamp;
    }

    /**
     * Returns the current time in milliseconds.
     *
     * @return {@link System#currentTimeMillis()}
     */
    private long timeGen() {
        return System.currentTimeMillis();
    }
}