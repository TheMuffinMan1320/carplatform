CREATE TABLE users (
    id              UUID PRIMARY KEY,
    email           VARCHAR(254)  NOT NULL,
    password_hash   VARCHAR(100)  NOT NULL,
    first_name      VARCHAR(100)  NOT NULL,
    last_name       VARCHAR(100)  NOT NULL,
    phone           VARCHAR(30),
    role            VARCHAR(20)   NOT NULL,
    location_id     UUID REFERENCES locations(id),
    enabled         BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL,
    updated_at      TIMESTAMPTZ   NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE INDEX idx_users_location_id ON users (location_id);
