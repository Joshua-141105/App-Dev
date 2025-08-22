package com.example.springapp.repository;

import com.example.springapp.model.Booking;
import com.example.springapp.model.ParkingSlot;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.springapp.model.User;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Find bookings by user
    List<Booking> findByUserOrderByCreatedDateDesc(User user);
    
    // Find bookings by user ID
    List<Booking> findByUserUserIdOrderByCreatedDateDesc(Long userId);
    
    // Find bookings by slot
    List<Booking> findBySlotOrderByStartTimeAsc(ParkingSlot slot);
    
    // Find bookings by status
    List<Booking> findByStatus(Booking.Status status);
    
    // Find active bookings (CONFIRMED or ACTIVE status)
    @Query("SELECT b FROM Booking b WHERE b.status IN ('CONFIRMED', 'ACTIVE')")
    List<Booking> findActiveBookings();
    
    // Check for time conflicts - This is the key query for time-based booking
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.slot.slotId = :slotId " +
           "AND b.status IN ('CONFIRMED', 'ACTIVE') " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    Long countConflictingBookings(@Param("slotId") Long slotId, 
                                 @Param("startTime") LocalDateTime startTime, 
                                 @Param("endTime") LocalDateTime endTime);
    
    // Find conflicting bookings for a specific slot and time range
    @Query("SELECT b FROM Booking b WHERE b.slot.slotId = :slotId " +
           "AND b.status IN ('CONFIRMED', 'ACTIVE') " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(@Param("slotId") Long slotId, 
                                        @Param("startTime") LocalDateTime startTime, 
                                        @Param("endTime") LocalDateTime endTime);
    
    // Find bookings that exclude a specific booking (useful for updates)
    @Query("SELECT b FROM Booking b WHERE b.slot.slotId = :slotId " +
           "AND b.status IN ('CONFIRMED', 'ACTIVE') " +
           "AND b.bookingId != :excludeBookingId " +
           "AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookingsExcluding(@Param("slotId") Long slotId, 
                                                   @Param("startTime") LocalDateTime startTime, 
                                                   @Param("endTime") LocalDateTime endTime,
                                                   @Param("excludeBookingId") Long excludeBookingId);
    
    // Find upcoming bookings for a slot
    @Query("SELECT b FROM Booking b WHERE b.slot.slotId = :slotId " +
           "AND b.status IN ('CONFIRMED', 'ACTIVE') " +
           "AND b.startTime >= :fromTime " +
           "ORDER BY b.startTime ASC")
    List<Booking> findUpcomingBookingsForSlot(@Param("slotId") Long slotId, 
                                            @Param("fromTime") LocalDateTime fromTime);
    
    // Find current active booking for a slot
    @Query("SELECT b FROM Booking b WHERE b.slot.slotId = :slotId " +
           "AND b.status = 'ACTIVE' " +
           "AND b.startTime <= :currentTime " +
           "AND b.endTime > :currentTime")
    List<Booking> findCurrentActiveBookingForSlot(@Param("slotId") Long slotId, 
                                                 @Param("currentTime") LocalDateTime currentTime);
    
    // Find bookings that are due for check-in (within next 30 minutes)
    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' " +
           "AND b.startTime BETWEEN :now AND :withinTime")
    List<Booking> findBookingsDueForCheckin(@Param("now") LocalDateTime now, 
                                           @Param("withinTime") LocalDateTime withinTime);
    
    // Find overdue bookings
    @Query("SELECT b FROM Booking b WHERE b.status = 'ACTIVE' " +
           "AND b.endTime < :currentTime")
    List<Booking> findOverdueBookings(@Param("currentTime") LocalDateTime currentTime);
    
    // Find bookings by date range
    @Query("SELECT b FROM Booking b WHERE " +
           "((b.startTime >= :startDate AND b.startTime <= :endDate) OR " +
           "(b.endTime >= :startDate AND b.endTime <= :endDate) OR " +
           "(b.startTime < :startDate AND b.endTime > :endDate))")
    List<Booking> findBookingsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);
    
    // Pagination support for user bookings
    Page<Booking> findByUserUserIdOrderByCreatedDateDesc(Long userId, Pageable pageable);
}
