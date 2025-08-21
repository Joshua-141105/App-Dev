package com.example.springapp.mapper;

import com.example.springapp.dto.FacilityDTO;
import com.example.springapp.model.Facility;
import com.example.springapp.model.User;

public class FacilityMapper {

    public static FacilityDTO toDTO(Facility facility) {
        if (facility == null) return null;
        FacilityDTO dto = new FacilityDTO();
        dto.setFacilityId(facility.getFacilityId());
        dto.setFacilityName(facility.getFacilityName());
        dto.setAddress(facility.getAddress());
        dto.setCity(facility.getCity());
        dto.setState(facility.getState());
        dto.setZipCode(facility.getZipCode());
        dto.setTotalSlots(facility.getTotalSlots());
        dto.setOperatingHours(facility.getOperatingHours());
        dto.setContactInfo(facility.getContactInfo());
        dto.setLatitude(facility.getLatitude());
        dto.setLongitude(facility.getLongitude());
        dto.setManagerId(facility.getManager() != null ? facility.getManager().getUserId() : null);
        return dto;
    }

    public static Facility toEntity(FacilityDTO dto, User manager) {
        if (dto == null) return null;
        Facility facility = new Facility();
        facility.setFacilityId(dto.getFacilityId());
        facility.setFacilityName(dto.getFacilityName());
        facility.setAddress(dto.getAddress());
        facility.setCity(dto.getCity());
        facility.setState(dto.getState());
        facility.setZipCode(dto.getZipCode());
        facility.setTotalSlots(dto.getTotalSlots());
        facility.setOperatingHours(dto.getOperatingHours());
        facility.setContactInfo(dto.getContactInfo());
        facility.setLatitude(dto.getLatitude());
        facility.setLongitude(dto.getLongitude());
        facility.setManager(manager);
        return facility;
    }
    public static void updateEntityFromDTO(Facility facility, FacilityDTO dto, User manager) {
        if (facility == null || dto == null) {
            return;
        }

        facility.setFacilityName(dto.getFacilityName());
        facility.setAddress(dto.getAddress());
        facility.setCity(dto.getCity());
        facility.setState(dto.getState());
        facility.setZipCode(dto.getZipCode());
        facility.setTotalSlots(dto.getTotalSlots());
        facility.setOperatingHours(dto.getOperatingHours());
        facility.setContactInfo(dto.getContactInfo());
        facility.setLatitude(dto.getLatitude());
        facility.setLongitude(dto.getLongitude());
        
        if (manager != null) {
            facility.setManager(manager);
        }
    }
}
