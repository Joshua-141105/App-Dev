package com.example.springapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.sql.Timestamp;

@Data
public class ParkingSlotDTO {
    private Long slotId;
    private String slotNumber;
    private String slotType;
    private Long facilityId;
    private double hourlyRate;
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    private String location;
    private int floor;
    private String section;
    private String coordinates;
    private String features;
    private Timestamp createdDate;
    private Timestamp lastModified;
}