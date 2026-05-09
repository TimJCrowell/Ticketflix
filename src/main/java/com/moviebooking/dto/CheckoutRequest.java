package com.moviebooking.dto;

import java.util.List;

/**
 * Request DTO used by the checkout endpoint.
 */
public class CheckoutRequest
{

    /** Showtime ID as an unsigned decimal string (mirrors the tf_token cookie pattern — JS sends Snowflake IDs as strings). */
    private String showtimeId;


    /** Seat labels selected by the user. */
    private List<String> seatLabels;

    /** card number as entered, validated and then discarded */
    private String cardNumber;



    /** @return Showtime Id*/
    public String getShowtimeId() {return showtimeId;}

    /** @param showtimeId Showtime Id to be set*/
    public void setShowtimeId(String showtimeId) {this.showtimeId = showtimeId;}

    /** @return selected seat labels*/
    public List<String> getSeatLabels() {return seatLabels;}

    /** @param seatLabels selected seat labels to be set*/
    public void setSeatLabels(List<String> seatLabels) {this.seatLabels = seatLabels;}

    /** @return entered card number*/
    public String getCardNumber() {return cardNumber;}

    /** @param card number entered by user*/
    public void setCardNumber(String cardNumber) {this.cardNumber = cardNumber;}
}//end of CheckoutRequest class