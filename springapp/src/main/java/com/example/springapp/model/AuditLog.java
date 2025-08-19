package com.example.springapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auditId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String resource;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Severity severity = Severity.LOW;

    @Column(nullable = false)
    private String ipAddress;

    @Column(nullable = false)
    private String sessionId;

    @Column(length = 1000)
    private String userAgent;

    @Column(length = 2000)
    private String details;

    @Column(columnDefinition = "TEXT")
    private String changes;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public enum Severity {
        LOW, MEDIUM, HIGH
    }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
