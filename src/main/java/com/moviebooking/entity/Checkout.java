package com.moviebooking.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity representing a completed checkout transaction.
 *
 * <p>Stores the purchasing user, showtime reference, selected seats,
 * total amount, status, and creation timestamp.</p>
 */
@Entity
@Table(name="CHECKOUTS")
public class Checkout
{
    /** Unique identifier for checkout transaction. */
    @Id
    @Column(name="CheckoutId")
    private long checkoutId;

    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumn(name="UserId", nullable = false)
    private User user;

    /** Identifier of the purchased showtime. */
    @Column(name="ShowtimeId", nullable = false)
    private long showtimeId;

    /** A list of seat labels associated with the checkout transaction.*/
    @ElementCollection
    @CollectionTable(
            name = "CHECKOUT_SEATS",
            joinColumns = @JoinColumn(name="CheckoutId")
    )
    @Column(name="SeatLabel")
    private List<String> seatLabels = new ArrayList<>();

    /** The total cost for this checkout.*/
    @Column(name="Total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    /** The current lifecycle status (like Pending, Approved, Cancelled). */
    @Column(name="Status", nullable = false, length = 32)
    private String status;

    /** A timestamp of when this checkout record was created. */
    @Column(name="CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    /** Default constructor. */
    public Checkout() {}

    /**
     * Constructs a checkout with all required fields.
     *
     * @param checkoutId unique checkout ID
     * @param user purchasing user
     * @param showtimeId target showtime ID
     * @param seatLabels selected seats
     * @param total checkout total amount
     * @param status initial checkout status
     * @param createdAt checkout creation timestamp
     */
    public Checkout(long checkoutId, User user, long showtimeId, List<String> seatLabels, BigDecimal total, String status, LocalDateTime createdAt)
    {
        this.checkoutId = checkoutId;
        this.user = user;
        this.showtimeId = showtimeId;
        this.seatLabels = seatLabels;
        this.total = total;
        this.status = status;
        this.createdAt = createdAt;
    }

    /** @return checkout id.*/
    public long getCheckoutId() {return checkoutId;}

    /** @param checkoutId Checkout Id to be set.*/
    public void setCheckoutId(long checkoutId) {this.checkoutId = checkoutId;}

    /** @return  Total amount. */
    public BigDecimal getTotal() {return total;}

    /** @param total Total amount to be set*/
    public void setTotal(BigDecimal total) {this.total = total;}

    /** @return selected seat labels. */
    public List<String> getSeatLabels() {return seatLabels;}

    /** @param seatLabels selected seats to be set. */
    public void setSeatLabels(List<String> seatLabels) {this.seatLabels = seatLabels;}

    /** @return showtime Id.*/
    public long getShowtimeId() {return showtimeId;}

    /** @param showtimeId showtime Id to be set. */
    public void setShowtimeId(long showtimeId) {this.showtimeId = showtimeId;}

    /** @return checkout status. */
    public String getStatus() {return status;}

    /** @param status status to be set. */
    public void setStatus(String status) {this.status = status;}

    public User getUser() {return user;}
    public void setUser(User user) {this.user = user;}

    /** @return creation timestamp*/
    public LocalDateTime getCreatedAt() {return createdAt;}

    /** @param createdAt timestamp to be set*/
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
}//Checkout class