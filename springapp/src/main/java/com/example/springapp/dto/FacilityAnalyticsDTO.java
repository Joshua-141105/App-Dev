package com.example.springapp.dto;

import lombok.Data;
import java.sql.Date;

@Data
public class FacilityAnalyticsDTO {
    private Long analyticsId;
    private Long facilityId;
    private Date date;
    private int totalBookings;
    private double occupancyRate;
    private double revenue;
    private double averageBookingDuration;
    private String peakHours;
    private double utilizationScore;
}