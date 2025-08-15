package com.example.springapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PositiveOrZero;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long analyticsId;

    @ManyToOne
    @JoinColumn(name = "facilityId", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Facility facility;

    @Column(nullable = false, updatable = false)
    private LocalDate date;

    @Builder.Default
    @Column(nullable = false)
    @PositiveOrZero
    private int totalBookings = 0;

    @Builder.Default
    @Column(nullable = false)
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private double occupancyRate = 0.0;

    @Builder.Default
    @Column(nullable = false)
    @PositiveOrZero
    private double revenue = 0.0;

    @Builder.Default
    @Column(nullable = false)
    @PositiveOrZero
    private double averageBookingDuration = 0.0;

    @Column(length = 50)
    private String peakHours;

    @Builder.Default
    @Column(nullable = false)
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private double utilizationScore = 0.0;

    public void updateOccupancyRate(int totalSlots) {
        if (totalSlots <= 0) {
            throw new IllegalArgumentException("Total slots must be positive");
        }
        this.occupancyRate = (totalBookings * 100.0) / totalSlots;
    }

    public void calculateUtilizationScore(double... weights) {
        // Normalized calculation with weights for different metrics
        this.utilizationScore = Math.min(1.0, 
            (0.4 * occupancyRate/100) + 
            (0.3 * revenue/1000) + 
            (0.3 * averageBookingDuration/24)
        );
    }

    public boolean isPeakDay() {
        return utilizationScore >= 0.8;
    }
}