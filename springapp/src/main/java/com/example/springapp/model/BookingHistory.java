package com.example.springapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @ManyToOne
    @JoinColumn(name = "bookingId", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "changed_by_user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User changedBy;

    // Status Tracking
    @Column(nullable = false, length = 50)
    private String statusChange;

    @Column(length = 50)
    private String previousStatus;

    @Column(length = 50)
    private String newStatus;

    @Column(nullable = false, updatable = false)
    private LocalDateTime changeDate;

    @Column(length = 500)
    private String notes;

    @Column(length = 500)
    private String reason;

    @PrePersist
    protected void onCreate() {
        if (this.changeDate == null) {
            this.changeDate = LocalDateTime.now();
        }
    }

    // Business Logic Methods
    public boolean isStatusChange() {
        return previousStatus != null && newStatus != null 
            && !previousStatus.equals(newStatus);
    }

    public boolean involvesUser(User user) {
        return changedBy != null && changedBy.equals(user);
    }

}