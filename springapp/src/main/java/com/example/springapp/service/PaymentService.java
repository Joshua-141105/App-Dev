package com.example.springapp.service;

import com.example.springapp.dto.PaymentDTO;
import com.example.springapp.mapper.PaymentMapper;
import com.example.springapp.model.Payment;
import com.example.springapp.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository repository;

    public List<PaymentDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(PaymentMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<PaymentDTO> getById(Long id) {
        return repository.findById(id)
                .map(PaymentMapper::toDTO);
    }

    public PaymentDTO save(PaymentDTO dto) {
        Payment payment = PaymentMapper.toEntity(dto);
        Payment saved = repository.save(payment);
        return PaymentMapper.toDTO(saved);
    }

    public PaymentDTO update(Long id, PaymentDTO dto) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setAmount(dto.getAmount());
                    if (dto.getPaymentMethod() != null) {
                        existing.setPaymentMethod(Payment.PaymentMethod.valueOf(dto.getPaymentMethod().toUpperCase()));
                    }
                    existing.setTransactionId(dto.getTransactionId());
                    if (dto.getStatus() != null) {
                        existing.setStatus(Payment.Status.valueOf(dto.getStatus().toUpperCase()));
                    }
                    if (dto.getPaymentDate() != null) {
                        existing.setPaymentDate(dto.getPaymentDate().toLocalDateTime());
                    }
                    existing.setRefundAmount(dto.getRefundAmount());
                    existing.setGatewayResponse(dto.getGatewayResponse());
                    return PaymentMapper.toDTO(repository.save(existing));
                })
                .orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
