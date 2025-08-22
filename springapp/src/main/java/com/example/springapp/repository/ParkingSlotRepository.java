package com.example.springapp.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.springapp.model.ParkingSlot;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    @Query("SELECT s FROM ParkingSlot s WHERE " +
       "(:facilityId IS NULL OR s.facility.facilityId = :facilityId) AND " +
       "(:slotType IS NULL OR s.slotType = :slotType) AND " +
       "(:availableOnly IS NULL OR s.isAvailable = :availableOnly)")
Page<ParkingSlot> findFiltered(@Param("facilityId") Long facilityId,
                               @Param("slotType") ParkingSlot.SlotType slotType,
                               @Param("availableOnly") Boolean availableOnly,
                               Pageable pageable);

}
