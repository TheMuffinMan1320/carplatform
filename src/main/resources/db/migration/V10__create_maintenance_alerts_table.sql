CREATE TABLE maintenance_alerts (
    id                      UUID PRIMARY KEY,
    vehicle_id              UUID          NOT NULL REFERENCES vehicles(id),
    service_type            VARCHAR(20)   NOT NULL,
    due_mileage             INTEGER,
    due_date                DATE,
    status                  VARCHAR(20)   NOT NULL,
    resolved_by_record_id   UUID REFERENCES maintenance_records(id),
    created_at              TIMESTAMPTZ   NOT NULL,
    updated_at              TIMESTAMPTZ   NOT NULL
);

-- Lets the evaluator cheaply check "is there already an OPEN alert for this vehicle+type"
-- before creating a duplicate.
CREATE INDEX idx_maintenance_alerts_vehicle_status ON maintenance_alerts (vehicle_id, status);
