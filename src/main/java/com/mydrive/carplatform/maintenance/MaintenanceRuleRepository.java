package com.mydrive.carplatform.maintenance;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRuleRepository extends JpaRepository<MaintenanceRule, ServiceType> {
}
