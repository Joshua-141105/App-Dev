package com.example.springapp.mapper;

import com.example.springapp.dto.ParkingSlotDTO;
import com.example.springapp.model.Facility;
import com.example.springapp.model.ParkingSlot;

import java.sql.Timestamp;

public class ParkingSlotMapper {

    public static ParkingSlotDTO toDTO(ParkingSlot slot) {
        if (slot == null) return null;

        ParkingSlotDTO dto = new ParkingSlotDTO();
        dto.setSlotId(slot.getSlotId());
        dto.setSlotNumber(slot.getSlotNumber());
        dto.setSlotType(slot.getSlotType() != null ? slot.getSlotType().name() : null);
        dto.setFacilityId(slot.getFacility() != null ? slot.getFacility().getFacilityId() : null);
        dto.setHourlyRate(slot.getHourlyRate());
        dto.setAvailable(slot.isAvailable());
        dto.setFloor(slot.getFloor());
        dto.setSection(slot.getSection());
        dto.setCoordinates(slot.getCoordinates());
        dto.setFeatures(slot.getFeatures());
        dto.setCreatedDate(slot.getCreatedDate() != null ? Timestamp.valueOf(slot.getCreatedDate()) : null);
        dto.setLastModified(slot.getLastModified() != null ? Timestamp.valueOf(slot.getLastModified()) : null);

        // Combining floor and section into a location string (optional)
        String location = "Floor " + slot.getFloor() + (slot.getSection() != null ? ", Section " + slot.getSection() : "");
        dto.setLocation(location.trim());

        return dto;
    }

    public static ParkingSlot toEntity(ParkingSlotDTO dto) {
        if (dto == null) return null;

        ParkingSlot slot = new ParkingSlot();
        slot.setSlotId(dto.getSlotId());
        slot.setSlotNumber(dto.getSlotNumber());

        if (dto.getSlotType() != null) {
            slot.setSlotType(ParkingSlot.SlotType.valueOf(dto.getSlotType().toUpperCase()));
        }

        if (dto.getFacilityId() != null) {
            Facility facility = new Facility();
            facility.setFacilityId(dto.getFacilityId());
            slot.setFacility(facility);
        }

        slot.setHourlyRate(dto.getHourlyRate());
        slot.setAvailable(dto.isAvailable());
        slot.setFloor(dto.getFloor());
        slot.setSection(dto.getSection());
        slot.setCoordinates(dto.getCoordinates());
        slot.setFeatures(dto.getFeatures());

        if (dto.getCreatedDate() != null) {
            slot.setCreatedDate(dto.getCreatedDate().toLocalDateTime());
        }
        if (dto.getLastModified() != null) {
            slot.setLastModified(dto.getLastModified().toLocalDateTime());
        }

        return slot;
    }
}
