package com.moviebooking.util;

import java.math.BigDecimal;

/**
 * Server-side ticket price. One selected seat = one ticket at this unit price.
 */

public final class TicketPricing {
    private TicketPricing(){}

    /** Price per seat (one ticket) */
    public static final BigDecimal PRICE_PER_SEAT = new BigDecimal("14.50");
}//end TicketPricing class