package com.moviebooking.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moviebooking.entity.Seat;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA {@link AttributeConverter} that serializes a {@code Seat[][]} seatmap
 * to/from a JSON text column.
 */
@Converter
public class SeatmapConverter implements AttributeConverter<Seat[][], String> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Seat[][] seatmap) {
        try {
            return mapper.writeValueAsString(seatmap);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize seatmap", e);
        }
    }

    @Override
    public Seat[][] convertToEntityAttribute(String json) {
        try {
            return mapper.readValue(json, Seat[][].class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize seatmap", e);
        }
    }
}