package com.example.springapp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Type type;

    @Builder.Default
    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdDate = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Column(length = 50)
    private String relatedEntityType;

    @Column(length = 50)
    private String relatedEntityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "userId")
    private User user;

    public enum Type {
        BOOKING_CONFIRMATION, 
        PAYMENT_SUCCESS, 
        PAYMENT_FAILURE,
        REMINDER, 
        ALERT,
        SYSTEM_UPDATE
    }
    
    public enum Priority {
        LOW, MEDIUM, HIGH, URGENT
    }
    public void markAsRead() {
        if (!this.isRead) {
            this.isRead = true;
        }
    }

    public boolean isHighPriority() {
        return priority == Priority.HIGH || priority == Priority.URGENT;
    }

    public String generateNotificationLink() {
        if (relatedEntityType == null || relatedEntityId == null) {
            return null;
        }
        return "/" + relatedEntityType.toLowerCase() + "/" + relatedEntityId;
    }

    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
    }
}