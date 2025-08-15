package com.example.springapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    // Relationships
    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true) // Enforces 1:1 at DB level
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties("payment")  // Breaks circular JSON reference
    private Booking booking;

    // Payment Details
    @Column(nullable = false)
    @Positive
    private double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(unique = true, length = 100)
    private String transactionId;

    // Status Tracking
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime paymentDate = LocalDateTime.now();

    @Builder.Default
    @PositiveOrZero
    private double refundAmount = 0;

    @Column(length = 500)
    private String gatewayResponse;

    // Enums
    public enum PaymentMethod {
        CREDIT_CARD, DEBIT_CARD, DIGITAL_WALLET, CASH, BANK_TRANSFER
    }

    public enum Status {
        PENDING, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED
    }

    // Business Logic Methods
    public void markCompleted(String transactionId) {
        this.status = Status.COMPLETED;
        this.transactionId = transactionId;
        this.paymentDate = LocalDateTime.now();
    }

    public void processRefund(double amount, String reason) {
        if (amount > this.amount - this.refundAmount) {
            throw new IllegalArgumentException("Refund amount exceeds available balance");
        }
        this.refundAmount += amount;
        this.status = (refundAmount == this.amount) ? Status.REFUNDED : Status.PARTIALLY_REFUNDED;
        this.gatewayResponse = reason;
    }

    public boolean isSuccessful() {
        return status == Status.COMPLETED || 
               status == Status.REFUNDED || 
               status == Status.PARTIALLY_REFUNDED;
    }
}
