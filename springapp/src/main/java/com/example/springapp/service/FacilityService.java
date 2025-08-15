package com.example.springapp.service;

import com.example.springapp.dto.FacilityDTO;
import com.example.springapp.mapper.FacilityMapper;
import com.example.springapp.model.Facility;
import com.example.springapp.model.User;
import com.example.springapp.repository.FacilityRepository;
import com.example.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private UserRepository userRepository;

    public List<FacilityDTO> getAll() {
        return facilityRepository.findAll()
                .stream()
                .map(FacilityMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<FacilityDTO> getById(Long id) {
        return facilityRepository.findById(id)
                .map(FacilityMapper::toDTO);
    }

    public FacilityDTO save(FacilityDTO dto) {
        User manager = userRepository.findById(dto.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        Facility facility = FacilityMapper.toEntity(dto, manager);
        return FacilityMapper.toDTO(facilityRepository.save(facility));
    }

    public FacilityDTO update(Long id, FacilityDTO dto) {
        return facilityRepository.findById(id)
                .map(existing -> {
                    User manager = userRepository.findById(dto.getManagerId())
                            .orElseThrow(() -> new RuntimeException("Manager not found"));
                    Facility updated = FacilityMapper.toEntity(dto, manager);
                    updated.setFacilityId(existing.getFacilityId());
                    return FacilityMapper.toDTO(facilityRepository.save(updated));
                })
                .orElse(null);
    }

    public void delete(Long id) {
        facilityRepository.deleteById(id);
    }
}
