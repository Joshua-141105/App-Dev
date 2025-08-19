package com.example.springapp.dto;

import lombok.Data;
import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class NotificationDTO {
    private Long notificationId;
    private Long userId;
    private String message;
    private String type;
    @JsonProperty("isRead")
    private boolean isRead;
    private Timestamp createdDate;
    private String priority;
    private String relatedEntityType;
    private String relatedEntityId;
}