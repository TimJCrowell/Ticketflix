package com.moviebooking.service;

import com.moviebooking.dto.RegisterRequest;
import com.moviebooking.entity.Customer;
import com.moviebooking.entity.Login;
import com.moviebooking.entity.User;
import com.moviebooking.exception.BadRequestException;
import com.moviebooking.repository.LoginRepository;
import com.moviebooking.repository.UserRepository;
import com.moviebooking.util.SnowflakeIdGenerator;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.Security;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private LoginRepository loginRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private AuthService authService;

    @BeforeAll
    static void registerBouncyCastle() {
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static byte[] hmac(byte[] key, byte[] data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512/256", "BC");
        mac.init(new SecretKeySpec(key, "HmacSHA512/256"));
        return mac.doFinal(data);
    }

    private static User stubUser() {
        User u = new Customer("Test", "User", "test@example.com", "encoded");
        u.setUserID(1L);
        return u;
    }

    private static Login stubLogin(Long token, byte[] key, LocalDateTime expiresAt, User user)
            throws Exception {
        byte[] tokenBytes = ByteBuffer.allocate(Long.BYTES).putLong(token).array();
        byte[] tokenHmac  = hmac(key, tokenBytes);
        return new Login(token, tokenHmac, user, expiresAt);
    }

    // =========================================================================
    // validateToken
    // =========================================================================

    @Test
    void validateToken_nonNumericString_throws() {
        assertThrows(RuntimeException.class,
                () -> authService.validateToken("not-a-number", "anyKey"));
    }

    @Test
    void validateToken_tokenNotInDatabase_throws() {
        when(loginRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> authService.validateToken("12345", "anyKey"));
    }

    @Test
    void validateToken_expiredToken_throws() throws Exception {
        byte[] key   = new byte[32];
        Long   token = 99L;
        Login  login = stubLogin(token, key, LocalDateTime.now().minusHours(1), stubUser());

        when(loginRepository.findById(token)).thenReturn(Optional.of(login));

        assertThrows(RuntimeException.class,
                () -> authService.validateToken(Long.toUnsignedString(token),
                                                Base64.getEncoder().encodeToString(key)));
    }

    @Test
    void validateToken_invalidBase64Key_throws() throws Exception {
        byte[] key   = new byte[32];
        Long   token = 100L;
        Login  login = stubLogin(token, key, LocalDateTime.now().plusHours(1), stubUser());

        when(loginRepository.findById(token)).thenReturn(Optional.of(login));

        assertThrows(RuntimeException.class,
                () -> authService.validateToken(Long.toUnsignedString(token), "not!!valid==base64"));
    }

    @Test
    void validateToken_wrongKey_throws() throws Exception {
        byte[] correctKey = new byte[32];
        byte[] wrongKey   = new byte[32];
        wrongKey[0] = 1;

        Long  token = 101L;
        Login login = stubLogin(token, correctKey, LocalDateTime.now().plusHours(1), stubUser());

        when(loginRepository.findById(token)).thenReturn(Optional.of(login));

        assertThrows(RuntimeException.class,
                () -> authService.validateToken(Long.toUnsignedString(token),
                                                Base64.getEncoder().encodeToString(wrongKey)));
    }

    @Test
    void validateToken_validTokenAndKey_returnsUser() throws Exception {
        byte[] key  = new byte[32];
        key[5] = 42;
        Long   token = 102L;
        User   user  = stubUser();
        Login  login = stubLogin(token, key, LocalDateTime.now().plusHours(1), user);

        when(loginRepository.findById(token)).thenReturn(Optional.of(login));

        User result = authService.validateToken(Long.toUnsignedString(token),
                                                Base64.getEncoder().encodeToString(key));

        assertSame(user, result);
    }

    // =========================================================================
    // loginAndGenerateToken
    // =========================================================================

    @Test
    void loginAndGenerateToken_userNotFound_throws() {
        when(userRepository.findByEmailAndRole(any(), any())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> authService.loginAndGenerateToken("a@b.com", "CUSTOMER", "pw"));
    }

    @Test
    void loginAndGenerateToken_wrongPassword_throws() {
        when(userRepository.findByEmailAndRole(any(), any()))
                .thenReturn(Optional.of(stubUser()));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThrows(RuntimeException.class,
                () -> authService.loginAndGenerateToken("a@b.com", "CUSTOMER", "wrongpw"));
    }

    @Test
    void loginAndGenerateToken_validCredentials_returnsLoginWithKeyAndExpiry() {
        Long tokenId = 999L;
        when(userRepository.findByEmailAndRole(any(), any()))
                .thenReturn(Optional.of(stubUser()));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(idGenerator.nextId()).thenReturn(tokenId);
        when(loginRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Login result = authService.loginAndGenerateToken("a@b.com", "CUSTOMER", "correctpw");

        assertEquals(tokenId, result.getLoginToken());
        assertNotNull(result.getRawKey());
        assertEquals(32, result.getRawKey().length);
        assertTrue(result.getExpiresAt().isAfter(LocalDateTime.now().plusHours(23)));
    }

    // =========================================================================
    // registerUser
    // =========================================================================

    @Test
    void registerUser_invalidRole_throwsBadRequestException() {
        RegisterRequest req = new RegisterRequest();
        req.setRole("ALIEN");

        assertThrows(BadRequestException.class, () -> authService.registerUser(req));
    }

    @Test
    void registerUser_duplicateEmailAndRole_throws() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("dup@example.com");
        req.setRole("CUSTOMER");

        when(userRepository.existsByEmailAndRole("dup@example.com", "CUSTOMER"))
                .thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.registerUser(req));
    }

    @Test
    void registerUser_validCustomer_savesWithEncodedPassword() {
        RegisterRequest req = new RegisterRequest();
        req.setFirstName("Jane");
        req.setLastName("Doe");
        req.setEmail("jane@example.com");
        req.setPassword("rawPassword");
        req.setRole("CUSTOMER");

        when(userRepository.existsByEmailAndRole(any(), any())).thenReturn(false);
        when(passwordEncoder.encode("rawPassword")).thenReturn("encodedPassword");
        when(idGenerator.nextId()).thenReturn(1L);
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        User saved = authService.registerUser(req);

        // role is a JPA discriminator column populated by Hibernate on load;
        // in a unit test we verify the concrete type and the fields registerUser sets.
        assertInstanceOf(Customer.class, saved);
        assertEquals("jane@example.com", saved.getEmail());
        assertEquals("encodedPassword", saved.getPassword());
    }
}
