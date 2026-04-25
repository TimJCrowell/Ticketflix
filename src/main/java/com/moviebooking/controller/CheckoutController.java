package com.moviebooking.controller;

import com.moviebooking.entity.User;
import com.moviebooking.service.AuthService;
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
    @Autowired
    private AuthService authService;

    /** Service dependency which handles checkout business logic.  */
    @Autowired
    private CheckoutService checkoutService;

    /**
     * Creates checkout with client requested data.
     * @param request incoming checkout payload.
     * @return HTTP 201 response with created checkout.
     */
    @PostMapping
    public ResponseEntity<CheckoutResponse> checkout(@RequestBody CheckoutRequest request, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
        {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }//end if
        String token = authHeader.substring(7).trim();
        if(token.isEmpty())
        {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }//end if

        try{
            User customer = authService.validateToken(token);
            CheckoutResponse response = checkoutService.createCheckout(request, customer);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }//end try catch
    }
}//end of checkoutcontroller class