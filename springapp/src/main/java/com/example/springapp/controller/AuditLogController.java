package com.example.springapp.controller;

import com.example.springapp.model.AuditLog;
import com.example.springapp.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    public List<AuditLog> getAllAuditLogs() {
        return auditLogService.getAllAuditLogs();
    }

    @GetMapping("/username/{username}")
    public List<AuditLog> getAuditLogsByUsername(@PathVariable String username) {
        return auditLogService.getAuditLogsByUsername(username);
    }

    @GetMapping("/action/{action}")
    public List<AuditLog> getAuditLogsByAction(@PathVariable String action) {
        return auditLogService.getAuditLogsByAction(action);
    }

    @GetMapping("/severity/{severity}")
    public List<AuditLog> getAuditLogsBySeverity(@PathVariable AuditLog.Severity severity) {
        return auditLogService.getAuditLogsBySeverity(severity);
    }

    @GetMapping("/date-range")
    public List<AuditLog> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return auditLogService.getAuditLogsByDateRange(startDate, endDate);
    }

    @GetMapping("/count/{severity}")
    public ResponseEntity<Long> getCountBySeverity(@PathVariable AuditLog.Severity severity) {
        Long count = auditLogService.getCountBySeverity(severity);
        return ResponseEntity.ok(count);
    }
}