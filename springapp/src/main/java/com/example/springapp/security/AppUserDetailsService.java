package com.example.springapp.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.springapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {
    private final UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        return userRepo.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
            .map(AppUserDetails::new)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + usernameOrEmail));
    }
}
