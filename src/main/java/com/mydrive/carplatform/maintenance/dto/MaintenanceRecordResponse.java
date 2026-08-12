package com.mydrive.carplatform.maintenance.dto;

import com.mydrive.carplatform.maintenance.MaintenanceRecord;
import com.mydrive.carplatform.maintenance.ServiceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceRecordResponse(
        UUID id,
        UUID vehicleId,
        ServiceType serviceType,
        LocalDate performedAt,
        int mileageAtService,
        BigDecimal cost,
        String notes,
        UUID performedById) {

    public static MaintenanceRecordResponse from(MaintenanceRecord record) {
        return new MaintenanceRecordResponse(
                record.getId(),
                record.getVehicle().getId(),
                record.getServiceType(),
                record.getPerformedAt(),
                record.getMileageAtService(),
                record.getCost(),
                record.getNotes(),
                record.getPerformedBy() != null ? record.getPerformedBy().getId() : null);
    }
}
