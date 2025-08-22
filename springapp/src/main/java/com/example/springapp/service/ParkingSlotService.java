package com.example.springapp.service;

import com.example.springapp.dto.ParkingSlotDTO;
import com.example.springapp.mapper.ParkingSlotMapper;
import com.example.springapp.model.ParkingSlot;
import com.example.springapp.repository.ParkingSlotRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ParkingSlotService {

    @Autowired
    private ParkingSlotRepository repository;

    public List<ParkingSlotDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(ParkingSlotMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Page<ParkingSlotDTO> getParkingSlots(int page, int size, Long facilityId, String slotType, Boolean availableOnly) {
    Pageable pageable = PageRequest.of(page, size);

    ParkingSlot.SlotType slotTypeEnum = null;
    if (slotType != null && !slotType.isEmpty()) {
        try {
            slotTypeEnum = ParkingSlot.SlotType.valueOf(slotType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid slotType value: " + slotType);
        }
    }

    Page<ParkingSlot> slots = repository.findFiltered(facilityId, slotTypeEnum, availableOnly, pageable);

    return slots.map(ParkingSlotMapper::toDTO);
}

    public Optional<ParkingSlotDTO> getById(Long id) {
        return repository.findById(id)
                .map(ParkingSlotMapper::toDTO);
    }

    public ParkingSlotDTO save(ParkingSlotDTO dto) {
        ParkingSlot slot = ParkingSlotMapper.toEntity(dto);
        ParkingSlot saved = repository.save(slot);
        return ParkingSlotMapper.toDTO(saved);
    }

    public ParkingSlotDTO update(Long id, ParkingSlotDTO dto) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setSlotNumber(dto.getSlotNumber());
                    if (dto.getSlotType() != null) {
                        existing.setSlotType(ParkingSlot.SlotType.valueOf(dto.getSlotType().toUpperCase()));
                    }
                    existing.setHourlyRate(dto.getHourlyRate());
                    existing.setAvailable(dto.isAvailable());
                    existing.setFloor(dto.getFloor());
                    existing.setSection(dto.getSection());
                    existing.setCoordinates(dto.getCoordinates());
                    existing.setFeatures(dto.getFeatures());

                    if (dto.getCreatedDate() != null) {
                        existing.setCreatedDate(dto.getCreatedDate().toLocalDateTime());
                    }
                    if (dto.getLastModified() != null) {
                        existing.setLastModified(dto.getLastModified().toLocalDateTime());
                    }

                    return ParkingSlotMapper.toDTO(repository.save(existing));
                })
                .orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
