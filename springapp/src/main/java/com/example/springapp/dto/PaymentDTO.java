package com.example.springapp.dto;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class PaymentDTO {
    private Long paymentId;
    private Long bookingId;
    private double amount;
    private String paymentMethod;
    private String transactionId;
    private String status;
    private Timestamp paymentDate;
    private double refundAmount;
    private String gatewayResponse;
}