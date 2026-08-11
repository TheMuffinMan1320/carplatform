package com.mydrive.carplatform.fleet;

import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class VehicleSpecifications {

    private VehicleSpecifications() {
    }

    public static Specification<Vehicle> locationId(UUID locationId) {
        return locationId == null
                ? null
                : (root, query, cb) -> cb.equal(root.get("location").get("id"), locationId);
    }

    public static Specification<Vehicle> status(VehicleStatus status) {
        return status == null ? null : (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Vehicle> pricingTier(PricingTier tier) {
        return tier == null ? null : (root, query, cb) -> cb.equal(root.get("pricingTier"), tier);
    }
}
