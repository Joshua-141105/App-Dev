package com.example.springapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogDTO {
    private Long auditId;
    private String username;
    private String action;
    private String resource;
    private String severity;
    private String ipAddress;
    private String sessionId;
    private String userAgent;
    private String details;
    private String changes;
    private LocalDateTime timestamp;
}