package com.moviebooking.service;

import com.moviebooking.entity.Checkout;
import com.moviebooking.dto.CheckoutRequest;
import com.moviebooking.dto.CheckoutResponse;
import com.moviebooking.repository.CheckoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service layer for the creation and validation of checkout. .
 * temporary implementation for checkout.
 * it records without full user/token wiring.
 */

@Service
public class CheckoutService
{
    /** Default status (pending) is assigned to newly created checkout*/
    private static final String STATUS_PENDING = "PENDING";

    /** Repository used to persist and query checkout entities.*/
    @Autowired
    private CheckoutRepository checkoutRepository;

    /**
     * Creates a checkout after validating request.
     * @param request incoming payload from the client.
     * @return persisted checkout response object.
     * @throws ResponseStatusException when the request is invalid.
     */
    public CheckoutResponse createCheckout(CheckoutRequest request)
    {
        if(request == null)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }//end if

        if(request.getShowtimeId() <= 0)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Showtimeid required");
        }//end if

        List<String> seats = request.getSeatLabels();
        if(seats == null || seats.isEmpty())
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one seat is required");
        }//end if

        BigDecimal total;
        if(request.getClientTotal() != null)
        {
            total = request.getClientTotal();
        }else
        {
            total = BigDecimal.ZERO;
        }//end if else

        if(total.compareTo(BigDecimal.ZERO) <= 0)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Total must be greater than 0");
        }//end if

        //temp until snowflake is fully implemented and merged with main branch
        long checkoutId = System.currentTimeMillis();

        Checkout checkout = new Checkout();
        checkout.setCheckoutId(checkoutId);
        checkout.setShowtimeId(request.getShowtimeId());
        checkout.setSeatLabels(seats);
        checkout.setTotal(total);
        checkout.setStatus(STATUS_PENDING);

        Checkout saved = checkoutRepository.save(checkout);

        //the request.userId() is temporary until checkout and Userid is wired.
        return new CheckoutResponse(
                saved.getCheckoutId(),
                request.getUserId(),
                saved.getShowtimeId(),
                saved.getSeatLabels(),
                saved.getTotal(),
                saved.getStatus(),
                saved.getCreatedAt()
        );
    }
}