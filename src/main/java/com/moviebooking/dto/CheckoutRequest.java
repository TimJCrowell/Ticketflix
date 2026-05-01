package com.moviebooking.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request DTO used by the checkout endpoint.
 */
public class CheckoutRequest
{
    /** Deprecated: customer is resolved from Authorization token, not request body. */
    private long userId;

    /** Identifier of the showtime being purchased. */
    private long showtimeId;


    /** Seat labels selected by the user. */
    private List<String> seatLabels;

    /** Total submitted by the client for server-side validation. */
    private BigDecimal clientTotal;

    /** @return deprecated user id field; customer is resolved from Authorization token */
    public long getUserId() {return userId;}

    /** @param userId deprecated field; ignored when token-based checkout is used.*/
    public void setUserId(long userId) {this.userId = userId;}

    /** @return Showtime Id*/
    public long getShowtimeId() {return showtimeId;}

    /** @param showtimeId Showtime Id to be set*/
    public void setShowtimeId(long showtimeId) {this.showtimeId = showtimeId;}

    /** @return selected seat labels*/
    public List<String> getSeatLabels() {return seatLabels;}

    /** @param seatLabels selected seat labels to be set*/
    public void setSeatLabels(List<String> seatLabels) {this.seatLabels = seatLabels;}

    /** @return  Total provided by client*/
    public BigDecimal getClientTotal() {return clientTotal;}

    /** @param clientTotal Total to be set*/
    public void setClientTotal(BigDecimal clientTotal) {this.clientTotal = clientTotal;}
}//end of CheckoutRequest class