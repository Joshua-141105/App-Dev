package com.example.springapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.sql.Timestamp;

@Data
public class VehicleDTO {
    private Long vehicleId;
    private Long userId;
    private String licensePlate;
    private String vehicleType;
    private String make;
    private String model;
    private String color;
    private int year;
    @JsonProperty("isDefault")
    private boolean isDefault;
}