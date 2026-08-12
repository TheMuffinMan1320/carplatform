CREATE TABLE maintenance_rules (
    service_type            VARCHAR(20) PRIMARY KEY,
    mileage_interval        INTEGER NOT NULL,
    time_interval_months    INTEGER NOT NULL
);

INSERT INTO maintenance_rules (service_type, mileage_interval, time_interval_months) VALUES
    ('OIL_CHANGE',    5000,  6),
    ('TIRE_ROTATION', 6000,  6),
    ('BRAKE_SERVICE', 12000, 12),
    ('INSPECTION',    12000, 12);
