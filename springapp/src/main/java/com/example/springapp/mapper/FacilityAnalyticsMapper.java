package com.example.springapp.mapper;

import com.example.springapp.dto.FacilityAnalyticsDTO;
import com.example.springapp.model.Facility;
import com.example.springapp.model.FacilityAnalytics;

import java.sql.Date;

public class FacilityAnalyticsMapper {

    public static FacilityAnalyticsDTO toDTO(FacilityAnalytics entity) {
        if (entity == null) return null;
        FacilityAnalyticsDTO dto = new FacilityAnalyticsDTO();
        dto.setAnalyticsId(entity.getAnalyticsId());
        dto.setFacilityId(entity.getFacility() != null ? entity.getFacility().getFacilityId() : null);
        dto.setDate(entity.getDate() != null ? Date.valueOf(entity.getDate()) : null);
        dto.setTotalBookings(entity.getTotalBookings());
        dto.setOccupancyRate(entity.getOccupancyRate());
        dto.setRevenue(entity.getRevenue());
        dto.setAverageBookingDuration(entity.getAverageBookingDuration());
        dto.setPeakHours(entity.getPeakHours());
        dto.setUtilizationScore(entity.getUtilizationScore());
        return dto;
    }

    public static FacilityAnalytics toEntity(FacilityAnalyticsDTO dto, Facility facility) {
        if (dto == null) return null;
        FacilityAnalytics entity = new FacilityAnalytics();
        entity.setAnalyticsId(dto.getAnalyticsId());
        entity.setFacility(facility);
        entity.setDate(dto.getDate() != null ? dto.getDate().toLocalDate() : null);
        entity.setTotalBookings(dto.getTotalBookings());
        entity.setOccupancyRate(dto.getOccupancyRate());
        entity.setRevenue(dto.getRevenue());
        entity.setAverageBookingDuration(dto.getAverageBookingDuration());
        entity.setPeakHours(dto.getPeakHours());
        entity.setUtilizationScore(dto.getUtilizationScore());
        return entity;
    }
}
