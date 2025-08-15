package com.example.springapp.dto;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class NotificationDTO {
    private Long notificationId;
    private Long userId;
    private String message;
    private String type;
    private boolean isRead;
    private Timestamp createdDate;
    private String priority;
    private String relatedEntityType;
    private String relatedEntityId;
}