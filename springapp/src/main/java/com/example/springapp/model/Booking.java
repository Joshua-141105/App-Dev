package com.example.springapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    
    // ID and Basic Attributes
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @Column(nullable = false, length = 20)
    private String vehicleNumber;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private double totalCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.CONFIRMED;

    @Builder.Default
    private int extendedTime = 0;

    // Timestamps
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdDate;
    
    private LocalDateTime lastModified;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne
    @JoinColumn(name = "slotId", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ParkingSlot slot;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changeDate DESC")
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<BookingHistory> history = new ArrayList<>();

    @OneToOne(mappedBy = "booking", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties("booking")  
    private Payment payment;

    public enum Status {
        CONFIRMED, ACTIVE, COMPLETED, CANCELLED, OVERDUE
    }
    
    @PrePersist
    protected void onCreate() {
        this.createdDate = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastModified = LocalDateTime.now();
    }

    // Business Logic Methods
    public void checkIn() {
        if (this.status != Status.CONFIRMED) {
            throw new IllegalStateException("Only confirmed bookings can check in");
        }
        this.checkInTime = LocalDateTime.now();
        addHistoryEntry(Status.ACTIVE, null, "Checked in");
    }

    public void checkOut() {
        if (this.status != Status.ACTIVE) {
            throw new IllegalStateException("Only active bookings can check out");
        }
        this.checkOutTime = LocalDateTime.now();
        addHistoryEntry(Status.COMPLETED, null, "Checked out");
    }

    public void cancel(String reason) {
        if (this.status == Status.COMPLETED || this.status == Status.CANCELLED) {
            throw new IllegalStateException("Cannot cancel completed or cancelled booking");
        }
        addHistoryEntry(Status.CANCELLED, null, "Cancelled: " + reason);
    }

    private void addHistoryEntry(Status newStatus, User changedBy, String notes) {
        BookingHistory entry = BookingHistory.builder()
            .booking(this)
            .statusChange(this.status + " → " + newStatus)
            .previousStatus(this.status.name())
            .newStatus(newStatus.name())
            .changedBy(changedBy)
            .changeDate(LocalDateTime.now())
            .notes(notes)
            .build();
        
        this.history.add(entry);
        this.status = newStatus;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
        payment.setBooking(this); // Maintain bidirectional sync
    }
    
}