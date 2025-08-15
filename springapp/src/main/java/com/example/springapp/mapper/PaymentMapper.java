package com.example.springapp.mapper;

import com.example.springapp.dto.PaymentDTO;
import com.example.springapp.model.Booking;
import com.example.springapp.model.Payment;

import java.sql.Timestamp;

public class PaymentMapper {

    public static PaymentDTO toDTO(Payment payment) {
        if (payment == null) return null;

        PaymentDTO dto = new PaymentDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setBookingId(payment.getBooking() != null ? payment.getBooking().getBookingId() : null);
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null);
        dto.setTransactionId(payment.getTransactionId());
        dto.setStatus(payment.getStatus() != null ? payment.getStatus().name() : null);
        dto.setPaymentDate(payment.getPaymentDate() != null ? Timestamp.valueOf(payment.getPaymentDate()) : null);
        dto.setRefundAmount(payment.getRefundAmount());
        dto.setGatewayResponse(payment.getGatewayResponse());
        return dto;
    }

    public static Payment toEntity(PaymentDTO dto) {
        if (dto == null) return null;

        Payment payment = new Payment();
        payment.setPaymentId(dto.getPaymentId());

        if (dto.getBookingId() != null) {
            Booking booking = new Booking();
            booking.setBookingId(dto.getBookingId());
            payment.setBooking(booking); // Only set ID, actual booking fetch handled in service if needed
        }

        payment.setAmount(dto.getAmount());

        if (dto.getPaymentMethod() != null) {
            payment.setPaymentMethod(Payment.PaymentMethod.valueOf(dto.getPaymentMethod().toUpperCase()));
        }

        payment.setTransactionId(dto.getTransactionId());

        if (dto.getStatus() != null) {
            payment.setStatus(Payment.Status.valueOf(dto.getStatus().toUpperCase()));
        }

        if (dto.getPaymentDate() != null) {
            payment.setPaymentDate(dto.getPaymentDate().toLocalDateTime());
        }

        payment.setRefundAmount(dto.getRefundAmount());
        payment.setGatewayResponse(dto.getGatewayResponse());

        return payment;
    }
}
