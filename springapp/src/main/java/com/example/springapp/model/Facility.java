package com.example.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long facilityId;

    // Basic Facility Information
    @Column(nullable = false, length = 100)
    private String facilityName;

    @Column(nullable = false)
    private String address;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String state;

    @Column(length = 10)
    private String zipCode;

    // Capacity Information
    @Column(nullable = false)
    private int totalSlots;

    @Column(nullable = false)
    @Builder.Default
    private int availableSlots = 0;

    // Operational Details
    private String operatingHours;
    private String contactInfo;

    // Location Data
    private double latitude;
    private double longitude;

    // Relationships
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "managerId",nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User manager;

    @OneToMany(
        mappedBy = "facility", 
        cascade = CascadeType.ALL, 
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @OrderBy("slotNumber ASC")
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonManagedReference
    private List<ParkingSlot> parkingSlots = new ArrayList<>();

    @OneToMany(
        mappedBy = "facility",
        cascade = CascadeType.ALL,
        fetch = FetchType.LAZY
    )
    @OrderBy("date DESC")
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<FacilityAnalytics> analytics = new ArrayList<>();

    // Audit Fields
    @Column(updatable = false)
    private LocalDateTime createdDate;

    // Lifecycle Methods
    @PrePersist
    public void prePersist() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
        if (availableSlots == 0) {
            availableSlots = totalSlots;
        }
    }

    public void addParkingSlot(ParkingSlot slot) {
        parkingSlots.add(slot);
        slot.setFacility(this);
    }

    public void removeParkingSlot(ParkingSlot slot) {
        parkingSlots.remove(slot);
        slot.setFacility(null);
    }
}