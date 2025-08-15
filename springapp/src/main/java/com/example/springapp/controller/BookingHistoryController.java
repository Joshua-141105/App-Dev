package com.example.springapp.controller;

import com.example.springapp.dto.BookingHistoryDTO;
import com.example.springapp.service.BookingHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booking-histories")
public class BookingHistoryController {

    private final BookingHistoryService historyService;
    public BookingHistoryController(BookingHistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public List<BookingHistoryDTO> getAll() {
        return historyService.getAllHistories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingHistoryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(historyService.getHistoryById(id));
    }

    @PostMapping
    public ResponseEntity<BookingHistoryDTO> create(@RequestBody BookingHistoryDTO dto) {
        return ResponseEntity.ok(historyService.createHistory(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        historyService.deleteHistory(id);
        return ResponseEntity.noContent().build();
    }
}
