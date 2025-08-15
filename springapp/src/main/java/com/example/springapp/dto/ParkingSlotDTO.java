package com.example.springapp.dto;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class ParkingSlotDTO {
    private Long slotId;
    private String slotNumber;
    private String slotType;
    private Long facilityId;
    private double hourlyRate;
    private boolean isAvailable;
    private String location;
    private int floor;
    private String section;
    private String coordinates;
    private String features;
    private Timestamp createdDate;
    private Timestamp lastModified;
}