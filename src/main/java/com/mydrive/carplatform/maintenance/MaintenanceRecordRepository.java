package com.mydrive.carplatform.maintenance;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, UUID> {

    List<MaintenanceRecord> findByVehicleIdOrderByPerformedAtDesc(UUID vehicleId);

    Optional<MaintenanceRecord> findFirstByVehicleIdAndServiceTypeOrderByPerformedAtDesc(
            UUID vehicleId, ServiceType serviceType);
}
