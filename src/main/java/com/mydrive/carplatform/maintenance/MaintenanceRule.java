package com.mydrive.carplatform.maintenance;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Reference/config data (seeded via Flyway, not the app), keyed directly by ServiceType --
 * unlike the rest of the domain this deliberately does not extend BaseEntity, since a UUID
 * surrogate key would add nothing for a small fixed lookup table.
 */
@Entity
@Table(name = "maintenance_rules")
public class MaintenanceRule {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", length = 20)
    private ServiceType serviceType;

    @Column(name = "mileage_interval", nullable = false)
    private int mileageInterval;

    @Column(name = "time_interval_months", nullable = false)
    private int timeIntervalMonths;

    protected MaintenanceRule() {
    }

    public MaintenanceRule(ServiceType serviceType, int mileageInterval, int timeIntervalMonths) {
        this.serviceType = serviceType;
        this.mileageInterval = mileageInterval;
        this.timeIntervalMonths = timeIntervalMonths;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public int getMileageInterval() {
        return mileageInterval;
    }

    public void setMileageInterval(int mileageInterval) {
        this.mileageInterval = mileageInterval;
    }

    public int getTimeIntervalMonths() {
        return timeIntervalMonths;
    }

    public void setTimeIntervalMonths(int timeIntervalMonths) {
        this.timeIntervalMonths = timeIntervalMonths;
    }
}
