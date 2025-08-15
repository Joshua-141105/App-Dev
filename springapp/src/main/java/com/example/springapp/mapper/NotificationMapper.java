package com.example.springapp.mapper;

import com.example.springapp.dto.NotificationDTO;
import com.example.springapp.model.Notification;
import com.example.springapp.model.User;

import java.sql.Timestamp;

public class NotificationMapper {

    public static NotificationDTO toDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationId(notification.getNotificationId());
        dto.setUserId(notification.getUser() != null ? notification.getUser().getUserId() : null);
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType() != null ? notification.getType().name() : null);
        dto.setRead(notification.isRead());
        dto.setCreatedDate(notification.getCreatedDate() != null ? Timestamp.valueOf(notification.getCreatedDate()) : null);
        dto.setPriority(notification.getPriority() != null ? notification.getPriority().name() : null);
        dto.setRelatedEntityType(notification.getRelatedEntityType());
        dto.setRelatedEntityId(notification.getRelatedEntityId());
        return dto;
    }

    public static Notification toEntity(NotificationDTO dto, User user) {
        Notification notification = new Notification();
        notification.setNotificationId(dto.getNotificationId());
        notification.setUser(user);
        notification.setMessage(dto.getMessage());
        if (dto.getType() != null) {
            notification.setType(Notification.Type.valueOf(dto.getType().toUpperCase()));
        }
        notification.setRead(dto.isRead());
        if (dto.getCreatedDate() != null) {
            notification.setCreatedDate(dto.getCreatedDate().toLocalDateTime());
        }
        if (dto.getPriority() != null) {
            notification.setPriority(Notification.Priority.valueOf(dto.getPriority().toUpperCase()));
        }
        notification.setRelatedEntityType(dto.getRelatedEntityType());
        notification.setRelatedEntityId(dto.getRelatedEntityId());
        return notification;
    }
}
