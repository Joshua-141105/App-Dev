package com.example.springapp.mapper;

import com.example.springapp.dto.BookingHistoryDTO;
import com.example.springapp.model.Booking;
import com.example.springapp.model.BookingHistory;
import com.example.springapp.model.User;

public class BookingHistoryMapper {

    public static BookingHistoryDTO toDTO(BookingHistory history) {
        BookingHistoryDTO dto = new BookingHistoryDTO();
        dto.setHistoryId(history.getHistoryId());
        dto.setBookingId(history.getBooking() != null ? history.getBooking().getBookingId() : null);
        dto.setChangedByUserId(history.getChangedBy() != null ? history.getChangedBy().getUserId() : null);
        dto.setStatusChange(history.getStatusChange());
        dto.setPreviousStatus(history.getPreviousStatus());
        dto.setNewStatus(history.getNewStatus());
        dto.setChangeDate(history.getChangeDate());
        dto.setNotes(history.getNotes());
        dto.setReason(history.getReason());
        return dto;
    }

    public static BookingHistory toEntity(BookingHistoryDTO dto, Booking booking, User changedBy) {
        BookingHistory history = new BookingHistory();
        history.setHistoryId(dto.getHistoryId());
        history.setBooking(booking);
        history.setChangedBy(changedBy);
        history.setStatusChange(dto.getStatusChange());
        history.setPreviousStatus(dto.getPreviousStatus());
        history.setNewStatus(dto.getNewStatus());
        history.setChangeDate(dto.getChangeDate());
        history.setNotes(dto.getNotes());
        history.setReason(dto.getReason());
        return history;
    }
}
