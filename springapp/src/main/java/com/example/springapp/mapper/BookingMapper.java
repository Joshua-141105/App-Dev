package com.example.springapp.mapper;

import com.example.springapp.dto.BookingDTO;
import com.example.springapp.model.Booking;
import com.example.springapp.model.ParkingSlot;
import com.example.springapp.model.Payment;
import com.example.springapp.model.User;

public class BookingMapper {

    public static BookingDTO toDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setBookingId(booking.getBookingId());
        dto.setVehicleNumber(booking.getVehicleNumber());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setTotalCost(booking.getTotalCost());
        dto.setStatus(booking.getStatus().name());
        dto.setExtendedTime(booking.getExtendedTime());
        dto.setCreatedDate(booking.getCreatedDate());
        dto.setLastModified(booking.getLastModified());
        dto.setCheckInTime(booking.getCheckInTime());
        dto.setCheckOutTime(booking.getCheckOutTime());
        dto.setUserId(booking.getUser() != null ? booking.getUser().getUserId() : null);
        dto.setSlotId(booking.getSlot() != null ? booking.getSlot().getSlotId() : null);
        dto.setPaymentId(booking.getPayment() != null ? booking.getPayment().getPaymentId() : null);
        return dto;
    }

    public static Booking toEntity(BookingDTO dto, User user, ParkingSlot slot, Payment payment) {
        Booking booking = new Booking();
        booking.setBookingId(dto.getBookingId());
        booking.setVehicleNumber(dto.getVehicleNumber());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setTotalCost(dto.getTotalCost());
        booking.setStatus(Booking.Status.valueOf(dto.getStatus().toUpperCase()));
        booking.setExtendedTime(dto.getExtendedTime());
        booking.setCreatedDate(dto.getCreatedDate());
        booking.setLastModified(dto.getLastModified());
        booking.setCheckInTime(dto.getCheckInTime());
        booking.setCheckOutTime(dto.getCheckOutTime());
        booking.setUser(user);
        booking.setSlot(slot);
        if (payment != null) booking.setPayment(payment);
        return booking;
    }
}