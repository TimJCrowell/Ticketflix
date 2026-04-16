package com.moviebooking.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="CHECKOUTS")
public class Checkout
{
    @Id
    @Column(name="CheckoutId")
    private long checkoutId;

    //@ManyToOne(fetch=FetchType.LAZY, optional=false)
    //@JoinColumn(name="UserId", nullable = false)
    //temp commented out due to not having user.java yet.
    //private User user;

    /*---------------------------------------------------------------------------------------------------------------------------------------------------------
    Temp until we have showtime class
    --------------------------------------------------------------------------------------------------------------------*/
    @Column(name="ShowtimeId", nullable = false)
    private long showtimeId;

    @ElementCollection
    @CollectionTable(
            name = "CHECKOUT_SEATS",
            joinColumns = @JoinColumn(name="CheckoutId")
    )

    @Column(name="SeatLabel")
    private List<String> seatLabels = new ArrayList<>();

    @Column(name="Total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name="Status", nullable = false, length = 32)
    private String status;

    @Column(name="CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    public Checkout() {}

    public Checkout(Long checkoutId, Long showtimeId, List<String> seatLabels, BigDecimal total, String status)
    {
        this.checkoutId = checkoutId;
        //this.user = user;
        this.showtimeId = showtimeId;
        this.seatLabels = seatLabels;
        this.total = total;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public long getCheckoutId() {return checkoutId;}
    public void setCheckoutId(long checkoutId) {this.checkoutId = checkoutId;}

    public BigDecimal getTotal() {return total;}
    public void setTotal(BigDecimal total) {this.total = total;}

    public List<String> getSeatLabels() {return seatLabels;}
    public void setSeatLabels(List<String> seatLabels) {this.seatLabels = seatLabels;}

    public long getShowtimeId() {return showtimeId;}
    public void setShowtimeId(long showtimeId) {this.showtimeId = showtimeId;}

    public String getStatus() {return status;}
    public void setStatus(String status) {this.status = status;}

    //public User getUser() {return user;}
    //public void setUser(User user) {this.user = user;}

    public LocalDateTime getCreatedAt() {return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}//Checkout class