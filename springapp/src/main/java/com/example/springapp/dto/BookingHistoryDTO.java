package com.example.springapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingHistoryDTO {
    private Long historyId;
    private Long bookingId;
    private Long changedByUserId;
    private String statusChange;
    private String previousStatus;
    private String newStatus;
    private LocalDateTime changeDate;
    private String notes;
    private String reason;
}