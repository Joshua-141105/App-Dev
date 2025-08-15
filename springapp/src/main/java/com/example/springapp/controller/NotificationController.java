package com.example.springapp.controller;

import com.example.springapp.dto.NotificationDTO;
import com.example.springapp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @GetMapping
    public List<NotificationDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public NotificationDTO create(@RequestBody NotificationDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotificationDTO> update(@PathVariable Long id, @RequestBody NotificationDTO dto) {
        NotificationDTO updated = service.update(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/user/{userId}")
    public List<NotificationDTO> getByUser(@PathVariable Long userId) {
        return service.getNotificationsByUser(userId);
    }

    @GetMapping("/user/{userId}/unread")
    public List<NotificationDTO> getUnreadByUser(@PathVariable Long userId) {
        return service.getUnreadNotificationsByUser(userId);
    }

    @PutMapping("/{id}/mark-read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        NotificationDTO updated = service.markAsRead(id);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/user/{userId}/mark-all-read")
    public void markAllAsRead(@PathVariable Long userId) {
        service.markAllAsRead(userId);
    }

    @GetMapping("/type/{type}")
    public List<NotificationDTO> getByType(@PathVariable String type) {
        return service.getNotificationsByType(type);
    }

    @GetMapping("/priority/{priority}")
    public List<NotificationDTO> getByPriority(@PathVariable String priority) {
        return service.getNotificationsByPriority(priority);
    }

    @GetMapping("/user/{userId}/unread-count")
    public long getUnreadCount(@PathVariable Long userId) {
        return service.getUnreadCount(userId);
    }
}