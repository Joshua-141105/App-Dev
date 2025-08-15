package com.example.springapp.repository;

import com.example.springapp.model.FacilityAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacilityAnalyticsRepository extends JpaRepository<FacilityAnalytics, Long> {
}