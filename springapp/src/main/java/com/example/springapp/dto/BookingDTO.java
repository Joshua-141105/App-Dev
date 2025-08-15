package com.example.springapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingDTO {
    private Long bookingId;
    private String vehicleNumber;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private double totalCost;
    private String status;
    private int extendedTime;
    private LocalDateTime createdDate;
    private LocalDateTime lastModified;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Long userId;
    private Long slotId;
    private Long paymentId; 
}
