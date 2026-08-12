package com.mydrive.carplatform.maintenance;

import com.mydrive.carplatform.common.entity.BaseEntity;
import com.mydrive.carplatform.fleet.Vehicle;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "maintenance_alerts")
public class MaintenanceAlert extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false, length = 20)
    private ServiceType serviceType;

    @Column(name = "due_mileage")
    private Integer dueMileage;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertStatus status;

    @Column(name = "resolved_by_record_id")
    private UUID resolvedByRecordId;

    protected MaintenanceAlert() {
    }

    public MaintenanceAlert(Vehicle vehicle, ServiceType serviceType, Integer dueMileage, LocalDate dueDate) {
        this.vehicle = vehicle;
        this.serviceType = serviceType;
        this.dueMileage = dueMileage;
        this.dueDate = dueDate;
        this.status = AlertStatus.OPEN;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public Integer getDueMileage() {
        return dueMileage;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }

    public UUID getResolvedByRecordId() {
        return resolvedByRecordId;
    }

    public void setResolvedByRecordId(UUID resolvedByRecordId) {
        this.resolvedByRecordId = resolvedByRecordId;
    }
}
