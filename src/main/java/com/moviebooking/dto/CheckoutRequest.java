package com.moviebooking.dto;

import java.math.BigDecimal;
import java.util.List;

public class CheckoutRequest
{
    private long userId;
    private long showtimeId;

    /*----------------------------------------------------------------------------------------------------
    place holder until we have a seat class
    */

    private List<String> seatLabels;
    private BigDecimal clientTotal;

    public long getUserId() {return userId;}
    public void setUserId(long userId) {this.userId = userId;}

    public long getShowtimeId() {return showtimeId;}
    public void setShowtimeId(long showtimeId) {this.showtimeId = showtimeId;}

    public List<String> getSeatLabels() {return seatLabels;}
    public void setSeatLabels(List<String> seatLabels) {this.seatLabels = seatLabels;}

    public BigDecimal getClientTotal() {return clientTotal;}
    public void setClientTotal(BigDecimal clientTotal) {this.clientTotal = clientTotal;}
}//end of CheckoutRequest class