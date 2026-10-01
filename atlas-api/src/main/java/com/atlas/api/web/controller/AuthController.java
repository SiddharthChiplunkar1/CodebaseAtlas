package com.atlas.api.web.controller;

import com.atlas.api.domain.user.User;
import com.atlas.api.domain.user.UserRepository;
import com.atlas.api.infrastructure.security.JwtService;
import com.atlas.api.web.dto.request.LoginRequest;
import com.atlas.api.web.dto.request.RegisterRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public AuthController(UserRepository userRepository, 
                          PasswordEncoder passwordEncoder, 
                          AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        if (userRepository.findByUsername(request.username()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        // Password IS hashed here (Production grade)
        user.setPassword(passwordEncoder.encode(request.password()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.email());
        String jwt = jwtService.generateToken(userDetails);

        // Set JWT as an HttpOnly secure cookie to prevent XSS (OWASP standard)
        Cookie cookie = new Cookie("atlas_jwt", jwt);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // In production with HTTPS, set to true
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 1 day
        cookie.setAttribute("SameSite", "Lax"); // Prevent CSRF attacks
        response.addCookie(cookie);

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        return ResponseEntity.ok(Map.of(
            "name", user.getUsername(),
            "login", user.getUsername(),
            "avatar_url", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("atlas_jwt", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Object principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        
        if (principal instanceof OAuth2User oauth2User) {
            return ResponseEntity.ok(Map.of(
                "name", oauth2User.getAttribute("name"),
                "login", oauth2User.getAttribute("login"),
                "avatar_url", oauth2User.getAttribute("avatar_url")
            ));
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return ResponseEntity.ok(Map.of(
                    "name", user.getUsername(),
                    "login", user.getUsername(),
                    "avatar_url", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
    }
}
