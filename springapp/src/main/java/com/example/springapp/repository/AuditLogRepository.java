package com.example.springapp.repository;

import com.example.springapp.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    List<AuditLog> findByUsernameContainingIgnoreCaseOrderByTimestampDesc(String username);
    
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
    
    List<AuditLog> findBySeverityOrderByTimestampDesc(AuditLog.Severity severity);
    
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<AuditLog> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.severity = :severity")
    Long countBySeverity(@Param("severity") AuditLog.Severity severity);
}