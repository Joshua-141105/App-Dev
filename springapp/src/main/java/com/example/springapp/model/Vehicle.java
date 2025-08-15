package com.example.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleId;

    @ManyToOne
    @JoinColumn(name = "userId",nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(nullable = false, length = 20)
    private String licensePlate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VehicleType vehicleType = VehicleType.CAR;

    @Column(length = 50)
    private String make;

    @Column(length = 50)
    private String model;

    @Column(length = 30)
    private String color;

    private Integer year;

    @Builder.Default
    @Column(nullable = false)
    private boolean isDefault = false;

    @Column(updatable = false)
    private LocalDateTime createdDate;

    public enum VehicleType {
        CAR, MOTORCYCLE, TRUCK, VAN, ELECTRIC
    }
    @PrePersist
    public void setCreationTimestamp() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
    }
    public boolean isElectric() {
        return vehicleType == VehicleType.ELECTRIC;
    }

    public void markAsDefault() {
        this.isDefault = true;
    }

    public void unmarkAsDefault() {
        this.isDefault = false;
    }
}