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
     * Creates a checkout for the authenticated customer.
     *
     * @param request    incoming checkout payload
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     * @return {@code 201 Created} with checkout data, or {@code 401 Unauthorized}
     *         when the session cookies are missing or invalid
     */
    @PostMapping
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestBody CheckoutRequest request,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        if (token == null || token.isBlank() || sessionKey == null || sessionKey.isBlank())
        {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }//end if

        User customer;
        try{
            customer = authService.validateToken(token, sessionKey);
        } catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }//end try catch

        CheckoutResponse response = checkoutService.createCheckout(request, customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}//end of checkoutcontroller class