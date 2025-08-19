package com.example.springapp.service;

import com.example.springapp.dto.UserDTO;
import com.example.springapp.mapper.UserMapper;
import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    private final PasswordEncoder passwordEncoder;

    public UserService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> getById(Long id) {
        return repository.findById(id)
                .map(UserMapper::toDTO);
    }

    public UserDTO save(UserDTO dto) {
        User user = UserMapper.toEntity(dto);
        user.setPasswordHash(passwordEncoder.encode("123456")); // Ensure password is encoded
        // passwordHash handling here if needed
        user.setActive(true);
        User saved = repository.save(user);
        return UserMapper.toDTO(saved);
    }

    public UserDTO update(Long id, UserDTO dto) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setUsername(dto.getUsername());
                    existing.setEmail(dto.getEmail());
                    existing.setFirstName(dto.getFirstName());
                    existing.setLastName(dto.getLastName());
                    existing.setPhone(dto.getPhone());
                    if (dto.getRole() != null) {
                        existing.setRole(User.Role.valueOf(dto.getRole().toUpperCase()));
                    }
                    existing.setActive(dto.isActive());
                    if (dto.getRegistrationDate() != null) {
                        existing.setRegistrationDate(dto.getRegistrationDate().toLocalDateTime());
                    }
                    if (dto.getLastLogin() != null) {
                        existing.setLastLogin(dto.getLastLogin().toLocalDateTime());
                    }
                    existing.setEmailVerified(dto.isEmailVerified());
                    return UserMapper.toDTO(repository.save(existing));
                })
                .orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}