package com.example.springapp.controller;

import com.example.springapp.dto.FacilityAnalyticsDTO;
import com.example.springapp.service.FacilityAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilityanalytics")
public class FacilityAnalyticsController {

    @Autowired
    private FacilityAnalyticsService service;

    @GetMapping
    public List<FacilityAnalyticsDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacilityAnalyticsDTO> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public FacilityAnalyticsDTO create(@RequestBody FacilityAnalyticsDTO dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FacilityAnalyticsDTO> update(@PathVariable Long id, @RequestBody FacilityAnalyticsDTO dto) {
        FacilityAnalyticsDTO updated = service.update(id, dto);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}