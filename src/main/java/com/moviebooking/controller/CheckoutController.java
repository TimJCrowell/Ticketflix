package com.moviebooking.controller;

import com.moviebooking.entity.Checkout;
import com.moviebooking.entity.User;
import com.moviebooking.service.AuthService;
import com.moviebooking.dto.CheckoutResponse;
import com.moviebooking.dto.CheckoutRequest;
import com.moviebooking.service.CheckoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    /**
     * Returns a checkout by ID. Managers may retrieve any checkout; other
     * authenticated users may only retrieve their own.
     *
     * @param id         the checkout's Snowflake ID
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     * @return {@code 200 OK} with the checkout, {@code 403 Forbidden} if the
     *         requester does not own it, or {@code 404 Not Found} if absent
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCheckout(
            @PathVariable Long id,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        User user = resolveUser(token, sessionKey);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Checkout checkout = checkoutService.getCheckout(id, user);
        return ResponseEntity.ok(checkout);
    }

    /**
     * Returns all checkouts for a given showtime (manager only).
     *
     * @param showtimeId the showtime's Snowflake ID
     * @param token      {@code tf_token} cookie
     * @param sessionKey {@code tf_key} cookie
     * @return {@code 200 OK} with the list of checkouts
     */
    @GetMapping
    public ResponseEntity<?> getCheckoutsByShowtime(
            @RequestParam Long showtimeId,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        User user = resolveUser(token, sessionKey);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!"MANAGER".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Manager role required");
        }//end if
        List<Checkout> checkouts = checkoutService.getCheckoutsByShowtime(showtimeId);
        return ResponseEntity.ok(checkouts);
    }

    @PostMapping
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestBody CheckoutRequest request,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String sessionKey) {
        User customer = resolveUser(token, sessionKey);
        if (customer == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        CheckoutResponse response = checkoutService.createCheckout(request, customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    /**
     * Resolves a session token + key pair to the owning {@link User}.
     *
     * @return the authenticated {@link User}, or {@code null} if the cookies
     *         are missing or the token is invalid
     */
    private User resolveUser(String token, String sessionKey) {
        if (token == null || token.isBlank() || sessionKey == null || sessionKey.isBlank()) return null;
        try {
            return authService.validateToken(token, sessionKey);
        } catch (RuntimeException e) {
            return null;
        }//end try catch
    }
}//end of checkoutcontroller class