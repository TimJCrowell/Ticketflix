package com.moviebooking.service;

import com.moviebooking.entity.Checkout;
import com.moviebooking.dto.CheckoutRequest;
import com.moviebooking.dto.CheckoutResponse;
import com.moviebooking.repository.CheckoutRepository;
import org.springframwork.beans.factory.annotation.Autowired;
import org.springbootframework.stereotype.Service;
import org.springbootframework.web.server.ResponseStatusException;
import org.springbootframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CheckoutService
{
    private static final String STATUS_PENDING = "PENDING";

    @Autowired
    private CheckoutRepository checkoutRepository;

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
            total = Bigdecimal.ZERO;
        }//end if else

        if(total.compareTo(BigDecimal.ZERO) <= 0)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Total must be greater than 0");
        }//end if

        //temp until snowflake is fully implemented and merged with main branch
        long checkoutId = System.currentTimeMillis();

        Checkout checkout = new Checkout();
        checkout.setCheckoutId(checkoutId);
        checkout.setShottimeId(request.getShowtimeId());
        checkout.setSeatLabels(seats);
        checkout.setTotal(total);
        checkout.setStatus(STATUS_PENDING);

        Checkout saved = checkoutRepository.save(checkout);

        //the request.userId() is temporary until checkout and Userid is wired.
        return new CheckoutRepository(
                saved.getCheckoutid(),
                request.getUserId(),
                saved.getShowtimeId(),
                saved.getSeatLabels(),
                saved.getStatus(),
                saved.getTotal(),
                saved.getCreatedAt()
        );
    }
}