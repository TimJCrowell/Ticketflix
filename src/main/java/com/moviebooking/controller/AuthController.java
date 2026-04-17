package com.moviebooking.controller;

import com.moviebooking.dto.EmailLookupRequest;
import com.moviebooking.dto.LoginRequest;
import com.moviebooking.dto.LoginResponse;
import com.moviebooking.dto.RegisterRequest;
import com.moviebooking.entity.Login;
import com.moviebooking.entity.User;
import com.moviebooking.exception.BadRequestException;
import com.moviebooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for authentication endpoints.
 *
 * <p>Implements a two-step login flow:</p>
 * <ol>
 *   <li>{@code POST /api/auth/login/email} — submit email, receive available roles.</li>
 *   <li>{@code POST /api/auth/login/password} — submit email + role + password,
 *       receive a session token.</li>
 * </ol>
 * <p>Registration is handled by {@code POST /api/auth/register}.</p>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Step 1 of login: looks up the roles registered to the given email.
     *
     * <p>Returns a JSON object {@code {"roles": [...]}}. The frontend skips
     * the role-selection screen when the list contains exactly one entry.</p>
     *
     * @param request request body containing the user's email
     * @return {@code 200 OK} with the roles list, or {@code 404 Not Found}
     *         if no account exists for that email
     */
    @PostMapping("/login/email")
    public ResponseEntity<?> lookup(@RequestBody EmailLookupRequest request) {
        List<String> roles = authService.lookupRoles(request.getEmail());
        if (roles.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No account found for that email");
        }
        return ResponseEntity.ok(Map.of("roles", roles));
    }

    /**
     * Step 2 of login: verifies credentials and issues a session token.
     *
     * @param request request body containing email, role, and password
     * @return {@code 200 OK} with a {@link com.moviebooking.dto.LoginResponse}
     *         (token + expiry), or {@code 401 Unauthorized} on bad credentials
     */
    @PostMapping("/login/password")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Login login = authService.loginAndGenerateToken(
                    request.getEmail(), request.getRole(), request.getPassword());
            return ResponseEntity.ok(new LoginResponse(login.getLoginToken(), login.getExpiresAt()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    /**
     * Registers a new user account.
     *
     * @param request request body containing first name, last name, email,
     *                password, role, and date of birth
     * @return {@code 201 Created} on success; {@code 400 Bad Request} for
     *         invalid input; {@code 409 Conflict} if the account already exists
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body("Account created for " + user.getEmail());
        } catch (BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}