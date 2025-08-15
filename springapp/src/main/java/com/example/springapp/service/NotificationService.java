package com.example.springapp.service;

import com.example.springapp.dto.NotificationDTO;
import com.example.springapp.mapper.NotificationMapper;
import com.example.springapp.model.Notification;
import com.example.springapp.model.User;
import com.example.springapp.repository.NotificationRepository;
import com.example.springapp.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<NotificationDTO> getAll() {
        return notificationRepository.findAll()
                .stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<NotificationDTO> getById(Long id) {
        return notificationRepository.findById(id)
                .map(NotificationMapper::toDTO);
    }

    public NotificationDTO save(NotificationDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getUserId()));
        Notification notification = NotificationMapper.toEntity(dto, user);
        return NotificationMapper.toDTO(notificationRepository.save(notification));
    }

    public NotificationDTO update(Long id, NotificationDTO dto) {
        return notificationRepository.findById(id)
                .map(existing -> {
                    User user = dto.getUserId() != null
                            ? userRepository.findById(dto.getUserId()).orElse(existing.getUser())
                            : existing.getUser();
                    Notification updated = NotificationMapper.toEntity(dto, user);
                    updated.setNotificationId(existing.getNotificationId());
                    return NotificationMapper.toDTO(notificationRepository.save(updated));
                })
                .orElse(null);
    }

    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    public List<NotificationDTO> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserUserId(userId)
                .stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotificationsByUser(Long userId) {
        return notificationRepository.findByUserUserIdAndIsReadFalse(userId)
                .stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public NotificationDTO markAsRead(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .map(notification -> {
                    notification.setRead(true);
                    return NotificationMapper.toDTO(notificationRepository.save(notification));
                })
                .orElse(null);
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.findByUserUserIdAndIsReadFalse(userId)
                .forEach(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                });
    }

    public List<NotificationDTO> getNotificationsByType(String type) {
        return notificationRepository.findByType(Notification.Type.valueOf(type.toUpperCase()))
                .stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getNotificationsByPriority(String priority) {
        return notificationRepository.findByPriority(Notification.Priority.valueOf(priority.toUpperCase()))
                .stream()
                .map(NotificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserUserIdAndIsReadFalse(userId);
    }
}
