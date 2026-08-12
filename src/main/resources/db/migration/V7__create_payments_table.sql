CREATE TABLE payments (
    id                          UUID PRIMARY KEY,
    reservation_id              UUID          NOT NULL REFERENCES reservations(id),
    amount                      NUMERIC(10,2) NOT NULL,
    currency                    VARCHAR(3)    NOT NULL,
    idempotency_key             VARCHAR(128)  NOT NULL,
    stripe_payment_intent_id    VARCHAR(100),
    status                      VARCHAR(20)   NOT NULL,
    failure_reason              TEXT,
    created_at                  TIMESTAMPTZ   NOT NULL,
    updated_at                  TIMESTAMPTZ   NOT NULL,
    CONSTRAINT uk_payments_idempotency_key UNIQUE (idempotency_key),
    CONSTRAINT uk_payments_stripe_payment_intent_id UNIQUE (stripe_payment_intent_id)
);

CREATE INDEX idx_payments_reservation_id ON payments (reservation_id);
