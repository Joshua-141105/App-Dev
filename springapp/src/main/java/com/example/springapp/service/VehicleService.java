package com.example.springapp.service;

import com.example.springapp.dto.VehicleDTO;
import com.example.springapp.mapper.VehicleMapper;
import com.example.springapp.model.User;
import com.example.springapp.model.Vehicle;
import com.example.springapp.repository.UserRepository;
import com.example.springapp.repository.VehicleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    public List<VehicleDTO> getAll() {
        return vehicleRepository.findAll()
                .stream()
                .map(VehicleMapper::toDTO)
                .collect(Collectors.toList());
    }

    public VehicleDTO getById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));
        return VehicleMapper.toDTO(vehicle);
    }

    public VehicleDTO create(VehicleDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));
        Vehicle vehicle = VehicleMapper.toEntity(dto, user);
        Vehicle saved = vehicleRepository.save(vehicle);
        return VehicleMapper.toDTO(saved);
    }

    public VehicleDTO update(Long id, VehicleDTO dto) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));

        existingVehicle.setUser(user);
        existingVehicle.setLicensePlate(dto.getLicensePlate());
        existingVehicle.setVehicleType(Vehicle.VehicleType.valueOf(dto.getVehicleType()));
        existingVehicle.setMake(dto.getMake());
        existingVehicle.setModel(dto.getModel());
        existingVehicle.setColor(dto.getColor());
        existingVehicle.setYear(dto.getYear());
        existingVehicle.setDefault(dto.isDefault());

        Vehicle updated = vehicleRepository.save(existingVehicle);
        return VehicleMapper.toDTO(updated);
    }

    public void delete(Long id) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));
        vehicleRepository.delete(existingVehicle);
    }
}
