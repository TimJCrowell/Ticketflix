package com.moviebooking.util;

import java.nio.ByteBuffer;
import java.util.Base64;

public class TokenEncoder {

    private static final int MAX_LENGTH = 12;
    private static final int LONG_BYTES = 8;

    public static String encode(long id) {
        ByteBuffer buffer = ByteBuffer.allocate(LONG_BYTES); // big-endian by default
        buffer.putLong(id);
        return Base64.getEncoder().encodeToString(buffer.array());
    }

    public static long decode(String base64) {
        if (base64 == null || base64.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("Invalid token: exceeds maximum length");
        }

        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid token: not valid base64");
        }

        if (bytes.length != LONG_BYTES) {
            throw new IllegalArgumentException("Invalid token: incorrect length after decoding");
        }

        return ByteBuffer.wrap(bytes).getLong(); // big-endian by default
    }
}