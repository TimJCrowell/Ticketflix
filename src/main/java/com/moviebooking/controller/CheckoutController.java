package com.moviebooking.controller;

import com.moviebooking.dto.CheckoutResponse;
import com.moviebooking.dto.CheckoutRequest;
import com.moviebooking.service.CheckoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for checkout related endpoints.
 */
@RestController
@RequestMapping("/api/checkout")
public class CheckoutController
{
    /** Service dependency which handles checkout business logic.  */
    @Autowired
    private CheckoutService checkoutService;

    /**
     * Creates checkout with client requested data.
     * @param request incoming checkout payload.
     * @return HTTP 201 response with created checkout.
     */
    @PostMapping
    public ResponseEntity<CheckoutResponse> checkout(@RequestBody CheckoutRequest request)
    {
        CheckoutResponse response = checkoutService.createCheckout(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}//end of checkoutcontroller class