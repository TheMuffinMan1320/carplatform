-- Created ahead of users/vehicles (both FK to locations) even though the full
-- Location CRUD API lands in a later phase.
CREATE TABLE locations (
    id              UUID PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    address_line1   VARCHAR(200)  NOT NULL,
    address_line2   VARCHAR(200),
    city            VARCHAR(100)  NOT NULL,
    region          VARCHAR(100)  NOT NULL,
    postal_code     VARCHAR(20)   NOT NULL,
    country         VARCHAR(100)  NOT NULL,
    phone           VARCHAR(30),
    active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL,
    updated_at      TIMESTAMPTZ   NOT NULL
);
