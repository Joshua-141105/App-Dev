package com.example.springapp.service;

import com.example.springapp.dto.BookingDTO;
import com.example.springapp.exception.BookingConflictException;
import com.example.springapp.exception.ResourceNotFoundException;
import com.example.springapp.mapper.BookingMapper;
import com.example.springapp.model.Booking;
import com.example.springapp.model.ParkingSlot;
import com.example.springapp.model.Payment;
import com.example.springapp.model.User;
import com.example.springapp.repository.BookingRepository;
import com.example.springapp.repository.ParkingSlotRepository;
import com.example.springapp.repository.PaymentRepository;
import com.example.springapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ParkingSlotRepository slotRepository;
    private final PaymentRepository paymentRepository;

    public BookingService(BookingRepository bookingRepository, UserRepository userRepository,
                          ParkingSlotRepository slotRepository, PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.slotRepository = slotRepository;
        this.paymentRepository = paymentRepository;
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO getBookingById(Long id) {
        return bookingRepository.findById(id)
                .map(BookingMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public List<BookingDTO> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserUserIdOrderByCreatedDateDesc(userId)
                .stream()
                .map(BookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO createBooking(BookingDTO dto) {
        // Validate entities exist
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));
        
        ParkingSlot slot = slotRepository.findById(dto.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + dto.getSlotId()));

        // Validate booking times
        validateBookingTime(dto.getStartTime(), dto.getEndTime());
        
        // Check for time conflicts
        if (hasTimeConflict(dto.getSlotId(), dto.getStartTime(), dto.getEndTime(), null)) {
            throw new BookingConflictException("The selected slot is already booked for the requested time period");
        }

        // Create booking
        Payment payment = dto.getPaymentId() != null ? 
            paymentRepository.findById(dto.getPaymentId()).orElse(null) : null;
        
        Booking booking = BookingMapper.toEntity(dto, user, slot, payment);
        
        // Don't mark slot as unavailable anymore - we use time-based availability
        Booking savedBooking = bookingRepository.save(booking);
        
        return BookingMapper.toDTO(savedBooking);
    }

    public BookingDTO updateBooking(Long id, BookingDTO dto) {
        Booking existing = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        // Validate entities exist
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));
        
        ParkingSlot slot = slotRepository.findById(dto.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + dto.getSlotId()));

        // Validate booking times
        validateBookingTime(dto.getStartTime(), dto.getEndTime());
        
        // Check for time conflicts (excluding current booking)
        if (hasTimeConflict(dto.getSlotId(), dto.getStartTime(), dto.getEndTime(), id)) {
            throw new BookingConflictException("The selected slot is already booked for the requested time period");
        }

        Payment payment = dto.getPaymentId() != null ? 
            paymentRepository.findById(dto.getPaymentId()).orElse(null) : null;

        Booking updated = BookingMapper.toEntity(dto, user, slot, payment);
        updated.setBookingId(existing.getBookingId());
        updated.setCreatedDate(existing.getCreatedDate()); // Preserve original creation date

        return BookingMapper.toDTO(bookingRepository.save(updated));
    }

    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        // You might want to add business logic here (e.g., only allow deletion if not active)
        bookingRepository.deleteById(id);
    }

    // Time-based availability checking methods
    public boolean isSlotAvailableForTime(Long slotId, LocalDateTime startTime, LocalDateTime endTime) {
        return !hasTimeConflict(slotId, startTime, endTime, null);
    }

    public boolean isSlotAvailableForTimeExcluding(Long slotId, LocalDateTime startTime, 
                                                 LocalDateTime endTime, Long excludeBookingId) {
        return !hasTimeConflict(slotId, startTime, endTime, excludeBookingId);
    }

    private boolean hasTimeConflict(Long slotId, LocalDateTime startTime, LocalDateTime endTime, Long excludeBookingId) {
        if (excludeBookingId != null) {
            List<Booking> conflicts = bookingRepository.findConflictingBookingsExcluding(
                slotId, startTime, endTime, excludeBookingId);
            return !conflicts.isEmpty();
        } else {
            Long conflictCount = bookingRepository.countConflictingBookings(slotId, startTime, endTime);
            return conflictCount > 0;
        }
    }

    private void validateBookingTime(LocalDateTime startTime, LocalDateTime endTime) {
        LocalDateTime now = LocalDateTime.now();
        
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        
        if (startTime.isBefore(now)) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }
        
        if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        
        // Add minimum and maximum duration checks
        long hours = java.time.Duration.between(startTime, endTime).toHours();
        if (hours < 1) {
            throw new IllegalArgumentException("Minimum booking duration is 1 hour");
        }
        
        if (hours > 24) {
            throw new IllegalArgumentException("Maximum booking duration is 24 hours");
        }
    }

    // Get available time slots for a parking slot on a specific date
    public List<TimeSlotDTO> getAvailableTimeSlots(Long slotId, LocalDateTime date) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + slotId));
        
        LocalDateTime dayStart = date.toLocalDate().atStartOfDay();
        LocalDateTime dayEnd = dayStart.plusDays(1).minusSeconds(1);
        
        List<Booking> existingBookings = bookingRepository.findConflictingBookings(
            slotId, dayStart, dayEnd);
        
        // Generate available time slots (this is a simplified version)
        // You can implement more sophisticated logic based on your requirements
        return generateAvailableSlots(dayStart, dayEnd, existingBookings);
    }

    private List<TimeSlotDTO> generateAvailableSlots(LocalDateTime dayStart, LocalDateTime dayEnd, 
                                                   List<Booking> existingBookings) {
        // Implementation for generating available time slots
        // This would create a list of available time periods
        // For brevity, I'm returning an empty list, but you should implement the logic
        return List.of();
    }

    // Check-in and check-out methods with time validation
    @Transactional
    public void checkIn(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        
        LocalDateTime now = LocalDateTime.now();
        
        // Allow check-in up to 30 minutes before start time
        LocalDateTime earliestCheckIn = booking.getStartTime().minusMinutes(30);
        
        if (now.isBefore(earliestCheckIn)) {
            throw new IllegalStateException("Check-in is too early. Earliest check-in time is " + earliestCheckIn);
        }
        
        if (now.isAfter(booking.getEndTime())) {
            throw new IllegalStateException("Cannot check-in after booking end time");
        }
        
        booking.checkIn();
        bookingRepository.save(booking);
    }

    @Transactional
    public void checkOut(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        
        booking.checkOut();
        bookingRepository.save(booking);
    }

    // Find overdue bookings
    public List<BookingDTO> findOverdueBookings() {
        return bookingRepository.findOverdueBookings(LocalDateTime.now())
                .stream()
                .map(BookingMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Inner class for time slot representation
    public static class TimeSlotDTO {
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private boolean available;
        
        // Constructors, getters, setters
        public TimeSlotDTO(LocalDateTime startTime, LocalDateTime endTime, boolean available) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.available = available;
        }
        
        // Getters and setters
        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
    }
}