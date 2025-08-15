package com.example.springapp.service;

import com.example.springapp.dto.BookingHistoryDTO;
import com.example.springapp.mapper.BookingHistoryMapper;
import com.example.springapp.model.Booking;
import com.example.springapp.model.BookingHistory;
import com.example.springapp.model.User;
import com.example.springapp.repository.BookingHistoryRepository;
import com.example.springapp.repository.BookingRepository;
import com.example.springapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingHistoryService {

    private final BookingHistoryRepository historyRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public BookingHistoryService(BookingHistoryRepository historyRepository, BookingRepository bookingRepository,
                                 UserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public List<BookingHistoryDTO> getAllHistories() {
        return historyRepository.findAll().stream()
                .map(BookingHistoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    public BookingHistoryDTO getHistoryById(Long id) {
        return historyRepository.findById(id)
                .map(BookingHistoryMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Booking history not found"));
    }

    public BookingHistoryDTO createHistory(BookingHistoryDTO dto) {
        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        User changedBy = dto.getChangedByUserId() != null ?
                userRepository.findById(dto.getChangedByUserId()).orElse(null) : null;

        BookingHistory history = BookingHistoryMapper.toEntity(dto, booking, changedBy);
        return BookingHistoryMapper.toDTO(historyRepository.save(history));
    }

    public void deleteHistory(Long id) {
        historyRepository.deleteById(id);
    }
}