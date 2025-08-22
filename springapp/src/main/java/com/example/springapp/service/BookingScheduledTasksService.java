package com.example.springapp.service;

import com.example.springapp.model.Booking;
import com.example.springapp.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

@Service
@Transactional
public class BookingScheduledTasksService {

    private static final Logger logger = Logger.getLogger(BookingScheduledTasksService.class.getName());

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService; // Assuming you have this service

    // Run every 5 minutes to check for overdue bookings
    @Scheduled(fixedRate = 300000) // 5 minutes = 300,000 milliseconds
    public void markOverdueBookings() {
        logger.info("Checking for overdue bookings...");
        
        LocalDateTime now = LocalDateTime.now();
        List<Booking> overdueBookings = bookingRepository.findOverdueBookings(now);
        
        for (Booking booking : overdueBookings) {
            booking.setStatus(Booking.Status.OVERDUE);
            bookingRepository.save(booking);
            
            // Send notification to user about overdue booking
            if (notificationService != null) {
                String message = String.format(
                    "Your booking for slot %s has exceeded the scheduled end time. Additional charges may apply.",
                    booking.getSlot().getSlotNumber()
                );
                // notificationService.sendOverdueNotification(booking.getUser().getUserId(), message, booking.getBookingId());
            }
            
            logger.info("Marked booking " + booking.getBookingId() + " as overdue");
        }
        
        if (!overdueBookings.isEmpty()) {
            logger.info("Marked " + overdueBookings.size() + " bookings as overdue");
        }
    }

    // Run every hour to automatically activate confirmed bookings at their start time
    @Scheduled(fixedRate = 3600000) // 1 hour = 3,600,000 milliseconds
    public void autoActivateBookings() {
        logger.info("Checking for bookings to auto-activate...");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextHour = now.plusHours(1);
        
        // Find confirmed bookings that should start within the next hour
        List<Booking> bookingsToActivate = bookingRepository.findBookingsDueForCheckin(now, nextHour);
        
        for (Booking booking : bookingsToActivate) {
            // Check if start time has passed
            if (now.isAfter(booking.getStartTime())) {
                // Auto check-in if within grace period (e.g., 30 minutes after start time)
                LocalDateTime graceEndTime = booking.getStartTime().plusMinutes(30);
                
                if (now.isBefore(graceEndTime)) {
                    booking.setStatus(Booking.Status.ACTIVE);
                    booking.setCheckInTime(booking.getStartTime()); // Use scheduled start time
                    bookingRepository.save(booking);
                    
                    // Send notification
                    if (notificationService != null) {
                        String message = String.format(
                            "Your booking for slot %s has been automatically activated.",
                            booking.getSlot().getSlotNumber()
                        );
                        // notificationService.sendBookingActivatedNotification(booking.getUser().getUserId(), message, booking.getBookingId());
                    }
                    
                    logger.info("Auto-activated booking " + booking.getBookingId());
                }
            }
        }
    }

    // Run daily at midnight to clean up old completed/cancelled bookings (optional)
    @Scheduled(cron = "0 0 0 * * ?") // Every day at midnight
    public void cleanupOldBookings() {
        logger.info("Starting daily cleanup of old bookings...");
        
        // Clean up bookings older than 30 days that are completed or cancelled
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        
        // This is a placeholder - you might want to archive instead of delete
        // List<Booking> oldBookings = bookingRepository.findOldCompletedBookings(cutoffDate);
        // Archive or perform cleanup operations
        
        logger.info("Daily cleanup completed");
    }

    // Run every 15 minutes to send reminders for upcoming bookings
    @Scheduled(fixedRate = 900000) // 15 minutes = 900,000 milliseconds
    public void sendUpcomingBookingReminders() {
        logger.info("Checking for upcoming booking reminders...");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderTime = now.plusMinutes(30); // 30 minutes ahead
        
        List<Booking> upcomingBookings = bookingRepository.findBookingsDueForCheckin(now, reminderTime);
        
        for (Booking booking : upcomingBookings) {
            // Check if we haven't already sent a reminder (you might want to add a field for this)
            if (booking.getStatus() == Booking.Status.CONFIRMED) {
                // Send reminder notification
                if (notificationService != null) {
                    String message = String.format(
                        "Reminder: Your parking slot %s booking starts at %s. Don't forget to check in!",
                        booking.getSlot().getSlotNumber(),
                        booking.getStartTime().toString() // Format as needed
                    );
                    // notificationService.sendUpcomingBookingReminder(booking.getUser().getUserId(), message, booking.getBookingId());
                }
                
                logger.info("Sent reminder for booking " + booking.getBookingId());
            }
        }
    }

    // Manual method to recalculate slot availability (can be called via endpoint)
    public void recalculateSlotAvailability() {
        logger.info("Recalculating slot availability...");
        
        LocalDateTime now = LocalDateTime.now();
        
        // Find all active bookings that should have ended
        List<Booking> expiredActiveBookings = bookingRepository.findOverdueBookings(now);
        
        for (Booking booking : expiredActiveBookings) {
            if (booking.getStatus() == Booking.Status.ACTIVE) {
                // Auto checkout if significantly overdue (e.g., 1 hour past end time)
                LocalDateTime autoCheckoutTime = booking.getEndTime().plusHours(1);
                
                if (now.isAfter(autoCheckoutTime)) {
                    booking.setStatus(Booking.Status.COMPLETED);
                    booking.setCheckOutTime(booking.getEndTime()); // Use scheduled end time
                    bookingRepository.save(booking);
                    
                    logger.info("Auto-completed overdue booking " + booking.getBookingId());
                }
            }
        }
        
        logger.info("Slot availability recalculation completed");
    }
}