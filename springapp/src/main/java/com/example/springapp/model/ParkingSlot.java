package com.example.springapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slotId;

    // Slot Identification
    @Column(unique = true, nullable = false, length = 10)
    private String slotNumber;

    // Slot Characteristics
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SlotType slotType = SlotType.REGULAR;

    @Column(nullable = false)
    private double hourlyRate;

    @Builder.Default
    @Column(nullable = false)
    private boolean isAvailable = true;

    // Location Details
    @Builder.Default
    @Column(nullable = false)
    private int floor = 1;

    private String section;
    private String coordinates;
    private String features;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facilityId", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonBackReference
    private Facility facility;

    @OneToMany(
        mappedBy = "slot",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @OrderBy("startTime ASC")
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<Booking> bookings = new ArrayList<>();

    // Audit Fields
    @Column(updatable = false)
    private LocalDateTime createdDate;

    private LocalDateTime lastModified;

    public enum SlotType {
        REGULAR, VIP, HANDICAPPED, ELECTRIC_VEHICLE
    }

    // Lifecycle Methods
    @PrePersist
    public void prePersist() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
        lastModified = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        lastModified = LocalDateTime.now();
    }

    // Business Logic Methods
    public boolean isElectric() {
        return slotType == SlotType.ELECTRIC_VEHICLE;
    }

    public boolean isAccessible() {
        return slotType == SlotType.HANDICAPPED;
    }

    public void markOccupied() {
        this.isAvailable = false;
    }

    public void markAvailable() {
        this.isAvailable = true;
    }
}