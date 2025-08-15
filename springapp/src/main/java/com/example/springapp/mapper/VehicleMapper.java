package com.example.springapp.mapper;

import com.example.springapp.dto.VehicleDTO;
import com.example.springapp.model.User;
import com.example.springapp.model.Vehicle;
import com.example.springapp.model.Vehicle.VehicleType;

public class VehicleMapper {

    public static VehicleDTO toDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        dto.setVehicleId(vehicle.getVehicleId());
        dto.setUserId(vehicle.getUser() != null ? vehicle.getUser().getUserId() : null);
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setVehicleType(vehicle.getVehicleType() != null ? vehicle.getVehicleType().name() : null); // Enum → String
        dto.setMake(vehicle.getMake());
        dto.setModel(vehicle.getModel());
        dto.setColor(vehicle.getColor());
        dto.setYear(vehicle.getYear());
        dto.setDefault(vehicle.isDefault());
        return dto;
    }

    public static Vehicle toEntity(VehicleDTO dto, User user) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(dto.getVehicleId());
        vehicle.setUser(user);
        vehicle.setLicensePlate(dto.getLicensePlate());

        if (dto.getVehicleType() != null) {
            try {
                vehicle.setVehicleType(VehicleType.valueOf(dto.getVehicleType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid vehicle type: " + dto.getVehicleType());
            }
        }

        vehicle.setMake(dto.getMake());
        vehicle.setModel(dto.getModel());
        vehicle.setColor(dto.getColor());
        vehicle.setYear(dto.getYear());
        vehicle.setDefault(dto.isDefault());
        return vehicle;
    }
}
