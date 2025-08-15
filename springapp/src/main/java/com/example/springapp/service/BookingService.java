package com.example.springapp.service;

import com.example.springapp.dto.BookingDTO;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
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
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public BookingDTO createBooking(BookingDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        ParkingSlot slot = slotRepository.findById(dto.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        Payment payment = dto.getPaymentId() != null ? paymentRepository.findById(dto.getPaymentId()).orElse(null) : null;

        Booking booking = BookingMapper.toEntity(dto, user, slot, payment);
        return BookingMapper.toDTO(bookingRepository.save(booking));
    }

    public BookingDTO updateBooking(Long id, BookingDTO dto) {
        Booking existing = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        ParkingSlot slot = slotRepository.findById(dto.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        Payment payment = dto.getPaymentId() != null ? paymentRepository.findById(dto.getPaymentId()).orElse(null) : null;

        Booking updated = BookingMapper.toEntity(dto, user, slot, payment);
        updated.setBookingId(existing.getBookingId());

        return BookingMapper.toDTO(bookingRepository.save(updated));
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }
}