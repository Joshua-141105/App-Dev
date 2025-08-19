package com.example.springapp.service;

import com.example.springapp.model.AuditLog;
import com.example.springapp.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }

    public AuditLog createAuditLog(String username, String action, String resource, 
                                  AuditLog.Severity severity, String ipAddress, 
                                  String sessionId, String userAgent, String details, 
                                  String changes) {
        
        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .resource(resource)
                .severity(severity)
                .ipAddress(ipAddress)
                .sessionId(sessionId)
                .userAgent(userAgent)
                .details(details)
                .changes(changes)
                .build();
        
        log.info("Audit Log Created: {} performed {} on {} with severity {}", 
                username, action, resource, severity);
        
        return auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAuditLogsByUsername(String username) {
        return auditLogRepository.findByUsernameContainingIgnoreCaseOrderByTimestampDesc(username);
    }

    public List<AuditLog> getAuditLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByTimestampDesc(action);
    }

    public List<AuditLog> getAuditLogsBySeverity(AuditLog.Severity severity) {
        return auditLogRepository.findBySeverityOrderByTimestampDesc(severity);
    }

    public List<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByTimestampBetween(startDate, endDate);
    }

    public Long getCountBySeverity(AuditLog.Severity severity) {
        return auditLogRepository.countBySeverity(severity);
    }
}