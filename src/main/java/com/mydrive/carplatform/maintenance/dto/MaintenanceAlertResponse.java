package com.mydrive.carplatform.maintenance.dto;

import com.mydrive.carplatform.maintenance.AlertStatus;
import com.mydrive.carplatform.maintenance.MaintenanceAlert;
import com.mydrive.carplatform.maintenance.ServiceType;
import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceAlertResponse(
        UUID id,
        UUID vehicleId,
        ServiceType serviceType,
        Integer dueMileage,
        LocalDate dueDate,
        AlertStatus status,
        UUID resolvedByRecordId) {

    public static MaintenanceAlertResponse from(MaintenanceAlert alert) {
        return new MaintenanceAlertResponse(
                alert.getId(),
                alert.getVehicle().getId(),
                alert.getServiceType(),
                alert.getDueMileage(),
                alert.getDueDate(),
                alert.getStatus(),
                alert.getResolvedByRecordId());
    }
}
