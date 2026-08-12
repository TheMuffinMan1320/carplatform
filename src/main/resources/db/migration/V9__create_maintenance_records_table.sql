CREATE TABLE maintenance_records (
    id                  UUID PRIMARY KEY,
    vehicle_id          UUID          NOT NULL REFERENCES vehicles(id),
    service_type        VARCHAR(20)   NOT NULL,
    performed_at        DATE          NOT NULL,
    mileage_at_service  INTEGER       NOT NULL,
    cost                NUMERIC(10,2),
    notes               TEXT,
    performed_by        UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ   NOT NULL,
    updated_at          TIMESTAMPTZ   NOT NULL
);

CREATE INDEX idx_maintenance_records_vehicle_id ON maintenance_records (vehicle_id);
