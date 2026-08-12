package com.mydrive.carplatform.maintenance;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MaintenanceAlertRepository
        extends JpaRepository<MaintenanceAlert, UUID>, JpaSpecificationExecutor<MaintenanceAlert> {

    Optional<MaintenanceAlert> findFirstByVehicleIdAndServiceTypeAndStatus(
            UUID vehicleId, ServiceType serviceType, AlertStatus status);
}
