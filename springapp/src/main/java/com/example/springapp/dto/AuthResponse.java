package com.example.springapp.dto;
import lombok.Data;

@Data
public class AuthResponse {
    private final String token;
    private final String role;
    private final String username;
}