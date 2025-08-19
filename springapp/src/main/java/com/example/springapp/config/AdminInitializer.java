package com.example.springapp.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.springapp.model.User;
import com.example.springapp.repository.UserRepository;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if any admin exists
        boolean adminExists = userRepository.existsByRole(User.Role.SYSTEM_ADMIN);

        if (!adminExists) {
            // Create default admin
            User admin = new User();
            admin.setUsername("admin");
            admin.setFirstName("admin");
            admin.setLastName("user");
            admin.setPasswordHash(passwordEncoder.encode("admin123")); // basic credentials
            admin.setRole(User.Role.SYSTEM_ADMIN);
            admin.setEmail("admin@portal.com");
            userRepository.save(admin);

            System.out.println("Default admin user created: username=admin, password=admin123");
        }
    }
}
