package com.example.springapp.repository;

import com.example.springapp.model.Facility;
import com.example.springapp.model.FacilityAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacilityAnalyticsRepository extends JpaRepository<FacilityAnalytics, Long> {

    List<FacilityAnalytics> findByFacility(Facility facility);

    List<FacilityAnalytics> findByFacilityFacilityId(Long facilityId);

    List<FacilityAnalytics> findByDate(LocalDate date);

    Optional<FacilityAnalytics> findByFacilityAndDate(Facility facility, LocalDate date);

    Optional<FacilityAnalytics> findByFacilityFacilityIdAndDate(Long facilityId, LocalDate date);

    List<FacilityAnalytics> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<FacilityAnalytics> findByFacilityAndDateBetween(Facility facility, LocalDate startDate, LocalDate endDate);

    List<FacilityAnalytics> findByFacilityFacilityIdAndDateBetween(Long facilityId, LocalDate startDate, LocalDate endDate);

    List<FacilityAnalytics> findAllByOrderByDateDesc();

    List<FacilityAnalytics> findByFacilityOrderByDateDesc(Facility facility);

    @Query("SELECT fa FROM FacilityAnalytics fa WHERE fa.occupancyRate > :occupancyRate")
    List<FacilityAnalytics> findByOccupancyRateGreaterThan(@Param("occupancyRate") double occupancyRate);

    @Query("SELECT fa FROM FacilityAnalytics fa WHERE fa.revenue > :revenue")
    List<FacilityAnalytics> findByRevenueGreaterThan(@Param("revenue") double revenue);

    @Query("SELECT fa FROM FacilityAnalytics fa WHERE fa.utilizationScore > :utilizationScore")
    List<FacilityAnalytics> findByUtilizationScoreGreaterThan(@Param("utilizationScore") double utilizationScore);

    @Query("SELECT fa FROM FacilityAnalytics fa WHERE fa.date BETWEEN :startDate AND :endDate " +
           "ORDER BY fa.revenue DESC")
    List<FacilityAnalytics> findTopByRevenueInDateRange(@Param("startDate") LocalDate startDate, 
                                                        @Param("endDate") LocalDate endDate);

    @Query("SELECT AVG(fa.occupancyRate) FROM FacilityAnalytics fa WHERE fa.facility = :facility " +
           "AND fa.date BETWEEN :startDate AND :endDate")
    Double getAverageOccupancyRateByFacilityAndDateRange(@Param("facility") Facility facility,
                                                         @Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(fa.revenue) FROM FacilityAnalytics fa WHERE fa.facility = :facility " +
           "AND fa.date BETWEEN :startDate AND :endDate")
    Double getTotalRevenueByFacilityAndDateRange(@Param("facility") Facility facility,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(fa.totalBookings) FROM FacilityAnalytics fa WHERE fa.facility = :facility " +
           "AND fa.date BETWEEN :startDate AND :endDate")
    Long getTotalBookingsByFacilityAndDateRange(@Param("facility") Facility facility,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);

    @Query("SELECT fa FROM FacilityAnalytics fa WHERE fa.date = :date " +
           "AND fa.utilizationScore = (SELECT MAX(fa2.utilizationScore) FROM FacilityAnalytics fa2 WHERE fa2.date = :date)")
    List<FacilityAnalytics> findPeakUtilizationFacilitiesByDate(@Param("date") LocalDate date);

    @Query("SELECT EXTRACT(MONTH FROM fa.date) as month, EXTRACT(YEAR FROM fa.date) as year, " +
           "SUM(fa.revenue) as totalRevenue, AVG(fa.occupancyRate) as avgOccupancy " +
           "FROM FacilityAnalytics fa WHERE fa.date BETWEEN :startDate AND :endDate " +
           "GROUP BY EXTRACT(YEAR FROM fa.date), EXTRACT(MONTH FROM fa.date) " +
           "ORDER BY EXTRACT(YEAR FROM fa.date), EXTRACT(MONTH FROM fa.date)")
    List<Object[]> getMonthlyRevenueSummary(@Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT fa FROM FacilityAnalytics fa WHERE fa.utilizationScore < :threshold " +
           "AND fa.date BETWEEN :startDate AND :endDate")
    List<FacilityAnalytics> findLowPerformingFacilities(@Param("threshold") double threshold,
                                                         @Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);

    void deleteByDateBefore(LocalDate date);

    boolean existsByFacilityAndDate(Facility facility, LocalDate date);

    @Query("SELECT fa FROM FacilityAnalytics fa WHERE fa.date = " +
           "(SELECT MAX(fa2.date) FROM FacilityAnalytics fa2 WHERE fa2.facility = fa.facility)")
    List<FacilityAnalytics> findLatestAnalyticsForAllFacilities();

    @Query("SELECT " +
           "COUNT(DISTINCT fa.facility) as totalFacilities, " +
           "SUM(fa.totalBookings) as totalBookings, " +
           "AVG(fa.occupancyRate) as avgOccupancyRate, " +
           "SUM(fa.revenue) as totalRevenue " +
           "FROM FacilityAnalytics fa WHERE fa.date BETWEEN :startDate AND :endDate")
    Object[] getAnalyticsSummary(@Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate);
}