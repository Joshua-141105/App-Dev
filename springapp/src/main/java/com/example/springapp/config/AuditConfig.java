package com.example.springapp.config;

import com.example.springapp.model.AuditLog;
import com.example.springapp.service.AuditLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

@Aspect
@Component
public class AuditConfig {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private ObjectMapper objectMapper;

    @AfterReturning(pointcut = "execution(* com.example.springapp.controller.AuthController.login(..))", returning = "result")
    public void auditLogin(JoinPoint joinPoint, Object result) {
        createAuditLog("LOGIN", "Authentication", AuditLog.Severity.LOW, 
                      "User successfully logged in", null);
    }

    @AfterReturning(pointcut = "execution(* com.example.springapp.controller.AuthController.register(..))", returning = "result")
    public void auditRegistration(JoinPoint joinPoint, Object result) {
        createAuditLog("REGISTRATION", "User Registration", AuditLog.Severity.MEDIUM, 
                      "New user registered", null);
    }

    @AfterReturning(pointcut = "execution(* com.example.springapp.controller.BookingController.create(..))", returning = "result")
    public void auditBookingCreation(JoinPoint joinPoint, Object result) {
        Object[] args = joinPoint.getArgs();
        String changes = null;
        try {
            changes = objectMapper.writeValueAsString(args[0]);
        } catch (Exception e) {
            changes = "Unable to serialize booking data";
        }
        createAuditLog("BOOKING_CREATED", "Booking Management", AuditLog.Severity.MEDIUM, 
                      "New booking created", changes);
    }

    @AfterReturning(pointcut = "execution(* com.example.springapp.controller.UserController.update(..))", returning = "result")
    public void auditUserUpdate(JoinPoint joinPoint, Object result) {
        Object[] args = joinPoint.getArgs();
        String changes = null;
        try {
            changes = objectMapper.writeValueAsString(args[1]);
        } catch (Exception e) {
            changes = "Unable to serialize user data";
        }
        createAuditLog("USER_UPDATED", "User Management", AuditLog.Severity.HIGH, 
                      "User information updated", changes);
    }

    @AfterThrowing(pointcut = "execution(* com.example.springapp.controller.*.*(..))", throwing = "exception")
    public void auditException(JoinPoint joinPoint, Throwable exception) {
        createAuditLog("ERROR", "System Error", AuditLog.Severity.HIGH, 
                      "Exception occurred: " + exception.getMessage(), null);
    }

    private void createAuditLog(String action, String resource, AuditLog.Severity severity, 
                               String details, String changes) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth != null ? auth.getName() : "anonymous";

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            String ipAddress = "unknown";
            String sessionId = "unknown";
            String userAgent = "unknown";

            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ipAddress = getClientIpAddress(request);
                sessionId = request.getSession(false) != null ? request.getSession().getId() : "no-session";
                userAgent = request.getHeader("User-Agent");
            }

            auditLogService.createAuditLog(username, action, resource, severity, 
                                         ipAddress, sessionId, userAgent, details, changes);
        } catch (Exception e) {
            // Log the error but don't fail the main operation
            System.err.println("Failed to create audit log: " + e.getMessage());
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            return xForwardedForHeader.split(",")[0];
        }
    }
}
