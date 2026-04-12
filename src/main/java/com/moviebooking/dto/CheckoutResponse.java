package com.moviebooking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class CheckoutResponse
{
    private long userId;
    private long showtimeId;
    private long checkoutId;
    private List<String> seatLabels;
    private BigDecimal total;
    private LocalDateTime createdAt;
    private String status;

    public checkoutresponse(Long checkoutId, Long userId, Long showtimeId, List<String> seatLabels, String status, LocalDateTime createdAt)
    {
        this.checkoutId = checkoutId;
        this.userId = userId;
        this.showtimeId = showtimeId;
        this.seatLabels = seatLabels;
        this.total = total;
        this.status = status;
        this.createdAt = createdAt;
    }//end of checkourresponse()

    public long getCheckoutId() {return checkoutId}

    public long getUserId() {return userId}

    public long getShowtimeId() {return showtimeId}

    public List<String> getSeatLabels() {return seatLabels}

    public String getStatus() {return status}

    public BigDecimal getTotal() {return total}

    public LocalDateTime getCreatedAt() {return createdAt}
}//end of checkoutrepsonse class