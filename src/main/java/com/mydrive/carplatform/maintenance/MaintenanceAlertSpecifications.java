package com.mydrive.carplatform.maintenance;

import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class MaintenanceAlertSpecifications {

    private MaintenanceAlertSpecifications() {
    }

    public static Specification<MaintenanceAlert> status(AlertStatus status) {
        return status == null ? null : (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<MaintenanceAlert> locationId(UUID locationId) {
        return locationId == null
                ? null
                : (root, query, cb) -> cb.equal(root.get("vehicle").get("location").get("id"), locationId);
    }
}
