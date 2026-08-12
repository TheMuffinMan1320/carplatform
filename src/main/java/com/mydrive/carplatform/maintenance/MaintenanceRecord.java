package com.mydrive.carplatform.maintenance;

import com.mydrive.carplatform.auth.User;
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
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false, length = 20)
    private ServiceType serviceType;

    @Column(name = "performed_at", nullable = false)
    private LocalDate performedAt;

    @Column(name = "mileage_at_service", nullable = false)
    private int mileageAtService;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(columnDefinition = "text")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    protected MaintenanceRecord() {
    }

    public MaintenanceRecord(
            Vehicle vehicle,
            ServiceType serviceType,
            LocalDate performedAt,
            int mileageAtService,
            BigDecimal cost,
            String notes,
            User performedBy) {
        this.vehicle = vehicle;
        this.serviceType = serviceType;
        this.performedAt = performedAt;
        this.mileageAtService = mileageAtService;
        this.cost = cost;
        this.notes = notes;
        this.performedBy = performedBy;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public LocalDate getPerformedAt() {
        return performedAt;
    }

    public int getMileageAtService() {
        return mileageAtService;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public String getNotes() {
        return notes;
    }

    public User getPerformedBy() {
        return performedBy;
    }
}
