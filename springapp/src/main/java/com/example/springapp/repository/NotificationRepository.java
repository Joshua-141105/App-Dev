package com.example.springapp.repository;

import com.example.springapp.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserUserId(Long userId);

    List<Notification> findByUserUserIdAndIsReadFalse(Long userId);

    Long countByUserUserIdAndIsReadFalse(Long userId);

    List<Notification> findByType(Notification.Type type);

    List<Notification> findByPriority(Notification.Priority priority);
}
