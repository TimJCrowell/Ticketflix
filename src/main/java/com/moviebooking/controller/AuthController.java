package com.moviebooking.controller;

import com.moviebooking.dto.ChangePasswordRequest;
import com.moviebooking.dto.EmailLookupRequest;
import com.moviebooking.dto.LoginRequest;
import com.moviebooking.dto.RegisterRequest;
import com.moviebooking.entity.Login;
import com.moviebooking.entity.User;
import com.moviebooking.exception.BadRequestException;
import com.moviebooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Base64;
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
     * <p>Sets two {@code SameSite=Strict} cookies: {@code tf_token} (readable by JS)
     * and {@code tf_key} (HttpOnly). Both have a 24-hour Max-Age matching the
     * server-side session TTL.</p>
     *
     * @param request request body containing email, role, and password
     * @return {@code 200 OK} with session cookies set, or {@code 401 Unauthorized}
     *         on bad credentials
     */
    @PostMapping("/login/password")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Login login = authService.loginAndGenerateToken(
                    request.getEmail(), request.getRole(), request.getPassword());
            // Session tokens expire after 24 hours on the server (see AuthService.TOKEN_EXPIRY_HOURS).
            // TODO: enable .secure(true) in production (requires HTTPS).
            Duration ttl = Duration.ofHours(24);
            ResponseCookie tokenCookie = ResponseCookie.from("tf_token", Long.toUnsignedString(login.getLoginToken()))
                    .httpOnly(false)
                    .secure(false)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(ttl)
                    .build();
            ResponseCookie keyCookie = ResponseCookie.from("tf_key", Base64.getEncoder().encodeToString(login.getRawKey()))
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(ttl)
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, tokenCookie.toString())
                    .header(HttpHeaders.SET_COOKIE, keyCookie.toString())
                    .build();
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
    /**
     * Changes the password for the currently authenticated user.
     *
     * @param request  body containing {@code currentPassword} and {@code newPassword}
     * @param token    value of the {@code tf_token} cookie (session ID)
     * @param rawKey   value of the {@code tf_key} cookie (HMAC key)
     * @return {@code 200 OK} on success; {@code 400} if current password is wrong;
     *         {@code 401} if the session is invalid or missing
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String rawKey) {
        if (token == null || token.isBlank() || rawKey == null || rawKey.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            authService.changePassword(token, rawKey, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully.");
        } catch (BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
    }

    /**
     * Invalidates a session by deleting its token from the database, then
     * clears the session cookies.
     *
     * @param token  value of the {@code tf_token} cookie
     * @param rawKey value of the {@code tf_key} cookie
     * @return {@code 200 OK} with cleared cookies on success; {@code 400 Bad Request}
     *         if the token is missing, expired, or the key does not match
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(value = "tf_token", required = false) String token,
            @CookieValue(value = "tf_key",   required = false) String rawKey) {
        try {
            if (token == null || rawKey == null) {
                throw new BadRequestException("No active session.");
            }
            authService.logout(token, rawKey);
            // TODO: enable .secure(true) in production (requires HTTPS).
            ResponseCookie clearToken = ResponseCookie.from("tf_token", "")
                    .httpOnly(false)
                    .secure(false)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(0)
                    .build();
            ResponseCookie clearKey = ResponseCookie.from("tf_key", "")
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(0)
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, clearToken.toString())
                    .header(HttpHeaders.SET_COOKIE, clearKey.toString())
                    .body("Logged out successfully.");
        } catch (BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}