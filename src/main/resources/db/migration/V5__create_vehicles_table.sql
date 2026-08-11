CREATE TABLE vehicles (
    id              UUID PRIMARY KEY,
    location_id     UUID          NOT NULL REFERENCES locations(id),
    make            VARCHAR(100)  NOT NULL,
    model           VARCHAR(100)  NOT NULL,
    year            INTEGER       NOT NULL,
    vin             VARCHAR(17)   NOT NULL,
    license_plate   VARCHAR(20),
    mileage         INTEGER       NOT NULL DEFAULT 0,
    status          VARCHAR(20)   NOT NULL,
    pricing_tier    VARCHAR(20)   NOT NULL,
    daily_rate      NUMERIC(10,2) NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL,
    updated_at      TIMESTAMPTZ   NOT NULL,
    CONSTRAINT uk_vehicles_vin UNIQUE (vin)
);

CREATE INDEX idx_vehicles_location_id ON vehicles (location_id);
CREATE INDEX idx_vehicles_status ON vehicles (status);
