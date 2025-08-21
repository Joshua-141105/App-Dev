package com.example.springapp.repository;

import com.example.springapp.model.Facility;
import com.example.springapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    // Find facilities by city
    List<Facility> findByCity(String city);

    // Find facilities by state
    List<Facility> findByState(String state);

    // Find facilities by manager
    List<Facility> findByManager(User manager);

    // Find facilities by manager ID
    List<Facility> findByManagerUserId(Long managerId);

    // Find facility by name
    Optional<Facility> findByFacilityName(String facilityName);

    // Find facilities with available slots greater than specified number
    @Query("SELECT f FROM Facility f WHERE f.availableSlots > :minSlots")
    List<Facility> findByAvailableSlotsGreaterThan(@Param("minSlots") int minSlots);

    // Find facilities by city and state
    List<Facility> findByCityAndState(String city, String state);

    // Find facilities within a certain radius (using bounding box approximation)
    @Query("SELECT f FROM Facility f WHERE " +
           "f.latitude BETWEEN :minLat AND :maxLat AND " +
           "f.longitude BETWEEN :minLon AND :maxLon")
    List<Facility> findFacilitiesWithinBounds(
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLon") double minLon,
            @Param("maxLon") double maxLon
    );

    // Find facilities with total slots greater than specified
    List<Facility> findByTotalSlotsGreaterThan(int totalSlots);

    // Count facilities by city
    @Query("SELECT COUNT(f) FROM Facility f WHERE f.city = :city")
    long countFacilitiesByCity(@Param("city") String city);

    // Get total slots across all facilities
    @Query("SELECT SUM(f.totalSlots) FROM Facility f")
    Long getTotalSlotsAcrossAllFacilities();

    // Get total available slots across all facilities
    @Query("SELECT SUM(f.availableSlots) FROM Facility f")
    Long getTotalAvailableSlotsAcrossAllFacilities();

    // Search facilities by name containing keyword (case-insensitive)
    @Query("SELECT f FROM Facility f WHERE LOWER(f.facilityName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Facility> searchByNameContaining(@Param("keyword") String keyword);

    // Find facilities ordered by available slots descending
    List<Facility> findAllByOrderByAvailableSlotsDesc();

    // Find facilities by zip code
    List<Facility> findByZipCode(String zipCode);

    // Check if facility name exists (for validation)
    boolean existsByFacilityName(String facilityName);

    // Find facilities managed by users with specific role
    @Query("SELECT f FROM Facility f WHERE f.manager.role = :role")
    List<Facility> findByManagerRole(@Param("role") String role);
}