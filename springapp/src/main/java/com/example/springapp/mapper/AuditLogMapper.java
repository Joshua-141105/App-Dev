package com.example.springapp.mapper;

import com.example.springapp.dto.AuditLogDTO;
import com.example.springapp.model.AuditLog;

public class AuditLogMapper {

    public static AuditLogDTO toDTO(AuditLog auditLog) {
        if (auditLog == null) return null;
        
        AuditLogDTO dto = new AuditLogDTO();
        dto.setAuditId(auditLog.getAuditId());
        dto.setUsername(auditLog.getUsername());
        dto.setAction(auditLog.getAction());
        dto.setResource(auditLog.getResource());
        dto.setSeverity(auditLog.getSeverity() != null ? auditLog.getSeverity().name() : null);
        dto.setIpAddress(auditLog.getIpAddress());
        dto.setSessionId(auditLog.getSessionId());
        dto.setUserAgent(auditLog.getUserAgent());
        dto.setDetails(auditLog.getDetails());
        dto.setChanges(auditLog.getChanges());
        dto.setTimestamp(auditLog.getTimestamp());
        return dto;
    }

    public static AuditLog toEntity(AuditLogDTO dto) {
        if (dto == null) return null;
        
        AuditLog auditLog = new AuditLog();
        auditLog.setAuditId(dto.getAuditId());
        auditLog.setUsername(dto.getUsername());
        auditLog.setAction(dto.getAction());
        auditLog.setResource(dto.getResource());
        if (dto.getSeverity() != null) {
            auditLog.setSeverity(AuditLog.Severity.valueOf(dto.getSeverity()));
        }
        auditLog.setIpAddress(dto.getIpAddress());
        auditLog.setSessionId(dto.getSessionId());
        auditLog.setUserAgent(dto.getUserAgent());
        auditLog.setDetails(dto.getDetails());
        auditLog.setChanges(dto.getChanges());
        auditLog.setTimestamp(dto.getTimestamp());
        return auditLog;
    }
    public static AuditLogDTO toDTOWithChanges(AuditLog auditLog, String changes) {
        AuditLogDTO dto = toDTO(auditLog);
        dto.setChanges(changes);
        return dto;
    }
    public static AuditLog toEntityWithChanges(AuditLogDTO dto, String changes) {
        AuditLog auditLog = toEntity(dto);
        auditLog.setChanges(changes);
        return auditLog;
    }
    public static AuditLogDTO toDTOWithSeverity(AuditLog auditLog, String severity) {
        AuditLogDTO dto = toDTO(auditLog);
        dto.setSeverity(severity);
        return dto;
    }
    public static AuditLog toEntityWithSeverity(AuditLogDTO dto, String severity) {
        AuditLog auditLog = toEntity(dto);
        if (severity != null) {
            auditLog.setSeverity(AuditLog.Severity.valueOf(severity));
        }
        return auditLog;
    }
}