package com.example.springapp.mapper;

import com.example.springapp.dto.UserDTO;
import com.example.springapp.model.User;

import java.sql.Timestamp;

public class UserMapper {

    public static UserDTO toDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        dto.setActive(user.isActive());
        dto.setRegistrationDate(user.getRegistrationDate() != null ? Timestamp.valueOf(user.getRegistrationDate()) : null);
        dto.setLastLogin(user.getLastLogin() != null ? Timestamp.valueOf(user.getLastLogin()) : null);
        dto.setEmailVerified(user.isEmailVerified());
        return dto;
    }

    public static User toEntity(UserDTO dto) {
        if (dto == null) return null;
        User user = new User();
        user.setUserId(dto.getUserId());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhone(dto.getPhone());
        if (dto.getRole() != null) {
            try {
                user.setRole(User.Role.valueOf(dto.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role: " + dto.getRole());
            }
        }
        user.setActive(dto.isActive());
        if (dto.getRegistrationDate() != null) {
            user.setRegistrationDate(dto.getRegistrationDate().toLocalDateTime());
        }
        if (dto.getLastLogin() != null) {
            user.setLastLogin(dto.getLastLogin().toLocalDateTime());
        }
        user.setEmailVerified(dto.isEmailVerified());
        return user;
    }
}
