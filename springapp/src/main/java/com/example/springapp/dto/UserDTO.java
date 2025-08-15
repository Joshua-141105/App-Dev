package com.example.springapp.dto;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class UserDTO {
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private boolean isActive;
    private Timestamp registrationDate;
    private Timestamp lastLogin;
    private boolean emailVerified;
}