package com.example.springapp.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;
import com.example.springapp.security.jwt.JwtService;
import com.example.springapp.dto.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .passwordHash(encoder.encode(req.getPassword())) // BCrypt here
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .phone(req.getPhone())
                .role(User.Role.USER)
                .isActive(true)
                .build();
        userRepo.save(user);
        String token = jwtService.generateToken(user.getUserId(),user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getUsername());
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsernameOrEmail(), req.getPassword())
        );
        User user = userRepo.findByUsernameOrEmail(req.getUsernameOrEmail(), req.getUsernameOrEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        user.recordLogin();
        userRepo.save(user);
        String token = jwtService.generateToken(user.getUserId(),user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getUsername());
    }
}
