CREATE TABLE reservations (
    id              UUID PRIMARY KEY,
    customer_id     UUID          NOT NULL REFERENCES users(id),
    vehicle_id      UUID          NOT NULL REFERENCES vehicles(id),
    start_date      DATE          NOT NULL,
    end_date        DATE          NOT NULL,
    status          VARCHAR(20)   NOT NULL,
    total_amount    NUMERIC(10,2) NOT NULL,
    version         BIGINT        NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ   NOT NULL,
    updated_at      TIMESTAMPTZ   NOT NULL,
    CONSTRAINT ck_reservations_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_reservations_vehicle_status ON reservations (vehicle_id, status);
CREATE INDEX idx_reservations_customer_id ON reservations (customer_id);

-- The source of truth for "no double-booking": enforced at the database level so it holds
-- even under concurrent requests, independent of the application-level pre-check in
-- ReservationService (which exists only to return a fast, friendly 409 in the common case).
ALTER TABLE reservations
    ADD CONSTRAINT reservations_no_overlap
    EXCLUDE USING gist (
        vehicle_id WITH =,
        daterange(start_date, end_date, '[]') WITH &&
    )
    WHERE (status IN ('RESERVED', 'ACTIVE'));
