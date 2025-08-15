package com.example.springapp.dto;

import lombok.Data;

@Data
public class FacilityDTO {
    private Long facilityId;
    private String facilityName;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private int totalSlots;
    private String operatingHours;
    private String contactInfo;
    private Long managerId;
    private double latitude;
    private double longitude;
}