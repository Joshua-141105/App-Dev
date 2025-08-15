package com.example.springapp.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String passwordHash;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(length = 15)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role= Role.USER;

    @Builder.Default
    private boolean isActive = true;

    private LocalDateTime registrationDate;
    private LocalDateTime lastLogin;

    @Builder.Default
    private boolean emailVerified = false;

    @OneToMany(mappedBy = "user",fetch = FetchType.LAZY, cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @OrderBy("createdDate DESC")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<Booking> bookings;

    @OneToMany(mappedBy = "user",fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<Vehicle> vehicles;
    
    @OneToMany(mappedBy = "manager",fetch=FetchType.LAZY,cascade= {CascadeType.PERSIST, CascadeType.MERGE})
    @OrderBy("facilityName ASC")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<Facility> managedFacilities;
    
    @OneToMany(mappedBy = "user",fetch = FetchType.LAZY,cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    @OrderBy("createdDate DESC")
    private List<Notification> notifications;

    public enum Role {
        USER, SECURITY, FACILITY_MANAGER, SYSTEM_ADMIN
    }

    @PrePersist
    public void setRegistrationTimestamp() {
        if (registrationDate == null) {
            registrationDate = LocalDateTime.now();
        }
    }
    public void recordLogin() {
        this.lastLogin = LocalDateTime.now();
    }
}
