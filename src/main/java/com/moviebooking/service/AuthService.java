package com.moviebooking.service;

import com.moviebooking.dto.RegisterRequest;
import com.moviebooking.exception.BadRequestException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.util.Base64;
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

    private static final SecureRandom secureRandom = new SecureRandom();

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
        byte[] tokenBytes = ByteBuffer.allocate(Long.BYTES).putLong(token).array();
        byte[] key = new byte[32];
        secureRandom.nextBytes(key);
        byte[] tokenHmac = computeHmac(key, tokenBytes);

        LocalDateTime expiresAt = LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS);
        Login saved = loginRepository.save(new Login(token, tokenHmac, user, expiresAt));
        saved.setRawKey(key);
        return saved;
    }

    /**
     * Resolves a session token to its owning {@link User} after verifying the HMAC key.
     *
     * <p>The caller must supply both the token (unsigned decimal Snowflake string) and
     * the raw 32-byte key (Base64-encoded) that was returned at login. The stored HMAC
     * is recomputed from the supplied key and compared in constant time; a mismatch is
     * treated identically to a missing token to prevent oracle attacks.</p>
     *
     * @param strToken   unsigned decimal string representation of the session token
     * @param base64Key  Base64-encoded raw HMAC key as issued at login
     * @return the {@link User} associated with the token
     * @throws RuntimeException if the token is invalid, expired, or the key does not match
     */
    public User validateToken(String strToken, String base64Key) {
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

        byte[] key;
        try {
            key = Base64.getDecoder().decode(base64Key);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid token");
        }

        byte[] tokenBytes = ByteBuffer.allocate(Long.BYTES).putLong(tokenId).array();
        byte[] expectedHmac = computeHmac(key, tokenBytes);
        if (!MessageDigest.isEqual(expectedHmac, login.getTokenHmac())) {
            throw new RuntimeException("Invalid token");
        }

        return login.getUser();
    }

    /**
     * Validates the session and permanently deletes the token from the database.
     *
     * @param strToken  unsigned decimal string representation of the session token
     * @param base64Key Base64-encoded raw HMAC key as issued at login
     * @throws BadRequestException if the token is missing, expired, or the key does not match
     */
    public void logout(String strToken, String base64Key) {
        try {
            validateToken(strToken, base64Key);
        } catch (RuntimeException e) {
            throw new BadRequestException("Invalid or expired session token.");
        }
        loginRepository.deleteById(Long.parseUnsignedLong(strToken));
    }

    private byte[] computeHmac(byte[] key, byte[] data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512/256", "BC");
            mac.init(new SecretKeySpec(key, "HmacSHA512/256"));
            return mac.doFinal(data);
        } catch (NoSuchAlgorithmException | NoSuchProviderException e) {
            throw new RuntimeException("CRITICAL: BouncyCastle HmacSHA512/256 is unavailable.", e);
        } catch (InvalidKeyException e) {
            throw new AssertionError("Impossible error: HMAC key rejected", e);
        }
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
