package com.mydrive.carplatform.booking;

import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class ReservationSpecifications {

    private ReservationSpecifications() {
    }

    public static Specification<Reservation> customerId(UUID customerId) {
        return customerId == null ? null : (root, query, cb) -> cb.equal(root.get("customer").get("id"), customerId);
    }

    public static Specification<Reservation> locationId(UUID locationId) {
        return locationId == null
                ? null
                : (root, query, cb) -> cb.equal(root.get("vehicle").get("location").get("id"), locationId);
    }

    public static Specification<Reservation> status(ReservationStatus status) {
        return status == null ? null : (root, query, cb) -> cb.equal(root.get("status"), status);
    }
}
