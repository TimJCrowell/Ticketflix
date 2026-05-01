package com.moviebooking.service;

import com.moviebooking.dto.RegisterRequest;
import com.moviebooking.exception.BadRequestException;
import java.util.List;
import com.moviebooking.entity.Customer;
import com.moviebooking.entity.Login;
import com.moviebooking.entity.Manager;
import com.moviebooking.entity.User;
import com.moviebooking.repository.LoginRepository;
import com.moviebooking.repository.UserRepository;
import com.moviebooking.util.SnowflakeIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

/**
 * Service handling user registration and the two-step login flow.
 *
 * <p>Step 1 — email lookup: returns the roles associated with an email so the
 * frontend can present (or skip) a role-selection screen.</p>
 * <p>Step 2 — password verification: validates credentials and issues a
 * Snowflake-based session token stored in the {@code LOGINS} table.</p>
 */
@Service
public class AuthService {

    private static final long TOKEN_EXPIRY_HOURS = 24;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private SnowflakeIdGenerator idGenerator;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Returns all roles registered to the given email address.
     *
     * @param email the email address to look up
     * @return list of role strings; empty if no account exists for that email
     */
    public List<String> lookupRoles(String email) {
        return userRepository.findRolesByEmail(email);
    }

    /**
     * Validates credentials and creates a new session token.
     *
     * <p>Uses Argon2 to verify the supplied password against the stored hash.
     * On success, a Snowflake ID is issued as the session token and persisted
     * in the {@code LOGINS} table with a {@value TOKEN_EXPIRY_HOURS}-hour TTL.</p>
     *
     * @param email       the user's email address
     * @param role        the role the user is logging in as (e.g. {@code "CUSTOMER"})
     * @param rawPassword the plain-text password submitted by the user
     * @return the persisted {@link Login} session record
     * @throws RuntimeException if the email/role combination is not found or the
     *                          password does not match
     */
    public Login loginAndGenerateToken(String email, String role, String rawPassword) {
        User user = userRepository.findByEmailAndRole(email, role)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // Argon2 verification: matches() handles the salt and parameters
        // automatically because they are encoded in the stored string.
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        Long token = idGenerator.nextId();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS);
        return loginRepository.save(new Login(token, user, expiresAt));
    }

    /**
     * Resolves a session token string to its owning {@link User}.
     *
     * <p>The token is expected to be the unsigned decimal representation of a
     * Snowflake {@code Long} (as returned by {@link com.moviebooking.dto.LoginResponse}).
     * Currently unused; will be wired in when protected endpoints are added.</p>
     *
     * @param strToken unsigned decimal string representation of the session token
     * @return the {@link User} associated with the token
     * @throws RuntimeException if the token string is not a valid unsigned long,
     *                          the token does not exist, or the session has expired
     */
    public User validateToken(String strToken) {
        long tokenId;
        try {
            tokenId = Long.parseUnsignedLong(strToken);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid token");
        }

        Login login = loginRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (login.isExpired()) {
            throw new RuntimeException("Token expired");
        }

        return login.getUser();
    }

    /**
     * Registers a new user account from the supplied request.
     *
     * <p>Validates the role, checks for duplicate email/role combinations,
     * creates the appropriate subclass ({@link Customer} or {@link Manager}),
     * assigns a Snowflake ID, and stores the Argon2-encoded password.</p>
     *
     * @param request the registration payload containing name, email, password,
     *                role, and date of birth
     * @return the newly persisted {@link User}
     * @throws BadRequestException if the role is not {@code "CUSTOMER"} or {@code "MANAGER"}
     * @throws RuntimeException    if an account with the same email and role already exists
     */
    public User registerUser(RegisterRequest request) {
        String role = request.getRole();

        if (!"CUSTOMER".equals(role) && !"MANAGER".equals(role)) {
            throw new BadRequestException("Invalid role: must be CUSTOMER or MANAGER");
        }

        if (userRepository.existsByEmailAndRole(request.getEmail(), role)) {
            throw new RuntimeException("An account with this email already exists for role: " + role);
        }

        User user = switch (role) {
            case "MANAGER" -> new Manager(
                    request.getFirstName(), request.getLastName(),
                    request.getEmail(), request.getPassword());
            case "CUSTOMER" -> new Customer(
                    request.getFirstName(), request.getLastName(),
                    request.getEmail(), request.getPassword());
            default -> throw new RuntimeException("Invalid role");
        };

        user.setUserID(idGenerator.nextId());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}
