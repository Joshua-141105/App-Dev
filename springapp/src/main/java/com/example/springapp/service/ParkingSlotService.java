package com.example.springapp.service;

import com.example.springapp.dto.ParkingSlotDTO;
import com.example.springapp.mapper.ParkingSlotMapper;
import com.example.springapp.model.Booking;
import com.example.springapp.model.ParkingSlot;
import com.example.springapp.repository.BookingRepository;
import com.example.springapp.repository.ParkingSlotRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ParkingSlotService {

    @Autowired
    private ParkingSlotRepository repository;
    
    @Autowired
    private BookingRepository bookingRepository;

    public List<ParkingSlotDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(slot -> {
                    ParkingSlotDTO dto = ParkingSlotMapper.toDTO(slot);
                    // Set real-time availability based on current bookings
                    dto.setAvailable(isSlotCurrentlyAvailable(slot.getSlotId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

   public Page<ParkingSlotDTO> getParkingSlots(int page, int size, Long facilityId,
                                                String slotType,
                                                Boolean availableOnly,
                                                LocalDateTime startTime,
                                                LocalDateTime endTime) {
        Pageable pageable = PageRequest.of(page, size);

        ParkingSlot.SlotType slotTypeEnum = null;
        if (slotType != null && !slotType.isEmpty()) {
            try {
                slotTypeEnum = ParkingSlot.SlotType.valueOf(slotType.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid slotType value: " + slotType);
            }
        }

        // Fetch slots from DB
        Page<ParkingSlot> slots = repository.findFiltered(facilityId, slotTypeEnum, null, pageable);

        // Map entities to DTOs + apply availability filtering
        List<ParkingSlotDTO> filteredList = slots.stream()
                .map(slot -> {
                    ParkingSlotDTO dto = ParkingSlotMapper.toDTO(slot);

                    if (startTime != null && endTime != null) {
                        boolean timeBasedAvailable = isSlotAvailableForTime(slot.getSlotId(), startTime, endTime);
                        dto.setAvailable(timeBasedAvailable);

                        if (Boolean.TRUE.equals(availableOnly) && !timeBasedAvailable) {
                            return null; // exclude
                        }
                    } else {
                        boolean currentlyAvailable = isSlotCurrentlyAvailable(slot.getSlotId());
                        dto.setAvailable(currentlyAvailable);

                        if (Boolean.TRUE.equals(availableOnly) && !currentlyAvailable) {
                            return null; // exclude
                        }
                    }
                    return dto;
                })
                .filter(dto -> dto != null) // remove excluded
                .collect(Collectors.toList());

        // Build a new PageImpl with filtered results
        return new PageImpl<>(filteredList, pageable, slots.getTotalElements());
    }

    // Overloaded method for backward compatibility
    public Page<ParkingSlotDTO> getParkingSlots(int page,
                                                int size,
                                                Long facilityId,
                                                String slotType,
                                                Boolean availableOnly) {
        return getParkingSlots(page, size, facilityId, slotType, availableOnly, null, null);
    }

    public Optional<ParkingSlotDTO> getById(Long id) {
        return repository.findById(id)
                .map(slot -> {
                    ParkingSlotDTO dto = ParkingSlotMapper.toDTO(slot);
                    dto.setAvailable(isSlotCurrentlyAvailable(slot.getSlotId()));
                    return dto;
                });
    }

    public ParkingSlotDTO save(ParkingSlotDTO dto) {
        ParkingSlot slot = ParkingSlotMapper.toEntity(dto);
        ParkingSlot saved = repository.save(slot);
        ParkingSlotDTO result = ParkingSlotMapper.toDTO(saved);
        result.setAvailable(isSlotCurrentlyAvailable(saved.getSlotId()));
        return result;
    }

    public ParkingSlotDTO update(Long id, ParkingSlotDTO dto) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setSlotNumber(dto.getSlotNumber());
                    if (dto.getSlotType() != null) {
                        existing.setSlotType(ParkingSlot.SlotType.valueOf(dto.getSlotType().toUpperCase()));
                    }
                    existing.setHourlyRate(dto.getHourlyRate());
                    // Don't update availability from DTO - it's calculated dynamically
                    existing.setFloor(dto.getFloor());
                    existing.setSection(dto.getSection());
                    existing.setCoordinates(dto.getCoordinates());
                    existing.setFeatures(dto.getFeatures());

                    if (dto.getCreatedDate() != null) {
                        existing.setCreatedDate(dto.getCreatedDate().toLocalDateTime());
                    }
                    if (dto.getLastModified() != null) {
                        existing.setLastModified(dto.getLastModified().toLocalDateTime());
                    }

                    ParkingSlot saved = repository.save(existing);
                    ParkingSlotDTO result = ParkingSlotMapper.toDTO(saved);
                    result.setAvailable(isSlotCurrentlyAvailable(saved.getSlotId()));
                    return result;
                })
                .orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    // Time-based availability checking methods
    public boolean isSlotCurrentlyAvailable(Long slotId) {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> activeBookings = bookingRepository.findCurrentActiveBookingForSlot(slotId, now);
        return activeBookings.isEmpty();
    }

    public boolean isSlotAvailableForTime(Long slotId, LocalDateTime startTime, LocalDateTime endTime) {
        Long conflictCount = bookingRepository.countConflictingBookings(slotId, startTime, endTime);
        return conflictCount == 0;
    }

    // Get all available slots for a specific time range
    public List<ParkingSlotDTO> getAvailableSlotsForTime(LocalDateTime startTime, LocalDateTime endTime) {
        List<ParkingSlot> allSlots = repository.findAll();
        
        return allSlots.stream()
                .filter(slot -> isSlotAvailableForTime(slot.getSlotId(), startTime, endTime))
                .map(slot -> {
                    ParkingSlotDTO dto = ParkingSlotMapper.toDTO(slot);
                    dto.setAvailable(true); // We already filtered for available slots
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Get upcoming bookings for a slot
    public List<BookingInfo> getUpcomingBookingsForSlot(Long slotId) {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> upcomingBookings = bookingRepository.findUpcomingBookingsForSlot(slotId, now);
        
        return upcomingBookings.stream()
                .map(booking -> new BookingInfo(
                    booking.getBookingId(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    booking.getStatus().toString(),
                    booking.getVehicleNumber()
                ))
                .collect(Collectors.toList());
    }

    // Inner class for booking information
    public static class BookingInfo {
        private Long bookingId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String status;
        private String vehicleNumber;

        public BookingInfo(Long bookingId, LocalDateTime startTime, LocalDateTime endTime, 
                          String status, String vehicleNumber) {
            this.bookingId = bookingId;
            this.startTime = startTime;
            this.endTime = endTime;
            this.status = status;
            this.vehicleNumber = vehicleNumber;
        }

        // Getters and setters
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getVehicleNumber() { return vehicleNumber; }
        public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    }
}