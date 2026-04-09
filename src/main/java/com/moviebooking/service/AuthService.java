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

    public List<String> lookupRoles(String email) {
        return userRepository.findRolesByEmail(email);
    }

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

    // Currently unused. Will be used to validate tokens stored on the client
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
