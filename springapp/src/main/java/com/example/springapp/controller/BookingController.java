package com.example.springapp.controller;

import com.example.springapp.dto.BookingDTO;
import com.example.springapp.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<BookingDTO> getAll() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/user/{userId}")
    public List<BookingDTO> getByUserId(@PathVariable Long userId) {
        return bookingService.getBookingsByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<BookingDTO> create(@RequestBody BookingDTO dto) {
        return ResponseEntity.ok(bookingService.createBooking(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingDTO> update(@PathVariable Long id, @RequestBody BookingDTO dto) {
        return ResponseEntity.ok(bookingService.updateBooking(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    // Time-based availability check
    @GetMapping("/check-availability")
    public ResponseEntity<Boolean> checkAvailability(
            @RequestParam Long slotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        boolean available = bookingService.isSlotAvailableForTime(slotId, startTime, endTime);
        return ResponseEntity.ok(available);
    }

    // Check-in endpoint
    @PostMapping("/{id}/checkin")
    public ResponseEntity<Void> checkIn(@PathVariable Long id) {
        bookingService.checkIn(id);
        return ResponseEntity.ok().build();
    }

    // Check-out endpoint
    @PostMapping("/{id}/checkout")
    public ResponseEntity<Void> checkOut(@PathVariable Long id) {
        bookingService.checkOut(id);
        return ResponseEntity.ok().build();
    }

    // Get overdue bookings
    @GetMapping("/overdue")
    public List<BookingDTO> getOverdueBookings() {
        return bookingService.findOverdueBookings();
    }

    // Get available time slots for a specific slot on a date
    @GetMapping("/available-slots/{slotId}")
    public ResponseEntity<List<BookingService.TimeSlotDTO>> getAvailableTimeSlots(
            @PathVariable Long slotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        List<BookingService.TimeSlotDTO> availableSlots = bookingService.getAvailableTimeSlots(slotId, date);
        return ResponseEntity.ok(availableSlots);
    }
}