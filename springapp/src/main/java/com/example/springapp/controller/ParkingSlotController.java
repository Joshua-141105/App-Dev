package com.example.springapp.controller;

import com.example.springapp.dto.ParkingSlotDTO;
import com.example.springapp.service.ParkingSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/parkingslots")
@CrossOrigin(origins = "*")
public class ParkingSlotController {

    @Autowired
    private ParkingSlotService service;

    @GetMapping
    public List<ParkingSlotDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/paginated")
    public Page<ParkingSlotDTO> getParkingSlots(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) Long facilityId,
        @RequestParam(required = false) String slotType,
        @RequestParam(required = false) Boolean availableOnly,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        
        return service.getParkingSlots(page, size, facilityId, slotType, availableOnly, startTime, endTime);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParkingSlotDTO> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ParkingSlotDTO create(@RequestBody ParkingSlotDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParkingSlotDTO> update(@PathVariable Long id, @RequestBody ParkingSlotDTO dto) {
        ParkingSlotDTO updated = service.update(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    // Get available slots for specific time range
    @GetMapping("/available")
    public List<ParkingSlotDTO> getAvailableSlotsForTime(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        return service.getAvailableSlotsForTime(startTime, endTime);
    }

    // Get upcoming bookings for a slot
    @GetMapping("/{id}/upcoming-bookings")
    public ResponseEntity<List<ParkingSlotService.BookingInfo>> getUpcomingBookings(@PathVariable Long id) {
        List<ParkingSlotService.BookingInfo> bookings = service.getUpcomingBookingsForSlot(id);
        return ResponseEntity.ok(bookings);
    }

    // Check if slot is currently available
    @GetMapping("/{id}/current-availability")
    public ResponseEntity<Boolean> getCurrentAvailability(@PathVariable Long id) {
        boolean available = service.isSlotCurrentlyAvailable(id);
        return ResponseEntity.ok(available);
    }
}