package com.example.springapp.service;

import com.example.springapp.dto.FacilityAnalyticsDTO;
import com.example.springapp.mapper.FacilityAnalyticsMapper;
import com.example.springapp.model.Facility;
import com.example.springapp.model.FacilityAnalytics;
import com.example.springapp.repository.FacilityAnalyticsRepository;
import com.example.springapp.repository.FacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacilityAnalyticsService {

    @Autowired
    private FacilityAnalyticsRepository analyticsRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    public List<FacilityAnalyticsDTO> getAll() {
        return analyticsRepository.findAll()
                .stream()
                .map(FacilityAnalyticsMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<FacilityAnalyticsDTO> getById(Long id) {
        return analyticsRepository.findById(id)
                .map(FacilityAnalyticsMapper::toDTO);
    }

    public FacilityAnalyticsDTO save(FacilityAnalyticsDTO dto) {
        Facility facility = facilityRepository.findById(dto.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        FacilityAnalytics entity = FacilityAnalyticsMapper.toEntity(dto, facility);
        return FacilityAnalyticsMapper.toDTO(analyticsRepository.save(entity));
    }

    public FacilityAnalyticsDTO update(Long id, FacilityAnalyticsDTO dto) {
        return analyticsRepository.findById(id)
                .map(existing -> {
                    Facility facility = facilityRepository.findById(dto.getFacilityId())
                            .orElseThrow(() -> new RuntimeException("Facility not found"));
                    FacilityAnalytics updatedEntity = FacilityAnalyticsMapper.toEntity(dto, facility);
                    updatedEntity.setAnalyticsId(existing.getAnalyticsId());
                    return FacilityAnalyticsMapper.toDTO(analyticsRepository.save(updatedEntity));
                })
                .orElse(null);
    }

    public void delete(Long id) {
        analyticsRepository.deleteById(id);
    }
}