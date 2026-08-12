# CarPlatform

A backend for a multi-location car rental operation: fleet management, customer-facing
rental booking with double-booking-proof availability, Stripe-backed payments, and
automated maintenance scheduling. JWT-secured REST API (Spring Boot 4.1 / Java 21),
designed to be consumed by a future React or React Native client.

Built to scale from a single-lot personal fleet to a multi-location operation — vehicles,
staff, and maintenance are all scoped by location from the schema up.

## Highlights

- **Double-booking is impossible, not just checked for.** Reservation overlap is enforced
  by a Postgres exclusion constraint (`EXCLUDE USING gist`), not just an application-level
  check — it holds even under concurrent requests.
- **Idempotency-safe payments.** Stripe PaymentIntents keyed on the client's idempotency
  key, passed straight through as Stripe's own request idempotency key, backed by a unique
  DB constraint — a retried request can't double-charge or double-create.
- **Self-issued JWT auth** with opaque, hashed, rotating refresh tokens and theft-reuse
  detection (reusing a rotated-away token revokes the whole chain and forces re-login).
- **Automated maintenance alerts** evaluated on both a scheduled sweep and reservation
  completion, deduplicated so re-crossing a threshold never spams duplicate alerts.
- **Role-based access** (customer / fleet agent / admin) enforced at the API layer and the
  data layer — a fleet agent literally cannot touch another location's fleet.
- **35 automated tests** (JUnit + Mockito + Testcontainers) covering state machines, auth
  flows, booking overlap, payment idempotency, webhook signature verification, and
  cross-tenant authorization — running against a real Postgres, not H2.
- Dockerized, with CI (GitHub Actions) running the full test suite on every push.

## Tech stack

Java 21 · Spring Boot 4.1 · Spring Security · Spring Data JPA · PostgreSQL · Flyway ·
Stripe API · JWT (jjwt) · springdoc-openapi · Testcontainers · JUnit 5 · Mockito · Docker ·
GitHub Actions

See `~/Downloads/carplatform-architecture.md` (generated alongside this repo) for a full
architecture write-up, or the sections below to run it locally.

## Prerequisites

- Java 21 (the project targets 21; a newer local JDK works fine since Maven compiles with
  `--release 21`)
- Docker Desktop (for Postgres locally and for Testcontainers-backed integration tests)
- A Stripe test-mode account, if you want to exercise real payment creation (optional --
  everything else runs without it)

## Running locally

```bash
./mvnw spring-boot:run
```

Spring Boot's docker-compose support auto-detects `compose.yaml` and starts a local
Postgres container for you -- no separate `docker compose up` needed. The app comes up on
`http://localhost:8080`, with Swagger UI at `http://localhost:8080/swagger-ui.html`.

On first boot in the `dev` profile (the default), `DevDataSeeder` creates demo accounts,
all with password `password123`:

| Email | Role |
|---|---|
| `admin@carplatform.dev` | ADMIN |
| `agent.downtown@carplatform.dev` | FLEET_AGENT (Downtown Austin) |
| `agent.airport@carplatform.dev` | FLEET_AGENT (Austin Airport) |
| `customer@carplatform.dev` | CUSTOMER |

along with two locations and a few vehicles, so you can start making authenticated
requests immediately.

### Full containerized run (app + Postgres, no local Maven/JDK needed)

```bash
docker compose -f compose.full.yaml up --build
```

## Frontend (React)

A React + TypeScript UI lives in `frontend/` and exercises every endpoint above across
all three roles — see `frontend/README.md` for setup and a full manual demo script. Quick
start once the backend is running on port 8080:

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`, dev-proxied to the backend so no CORS configuration is
needed.

## Configuration

All runtime config is environment-variable driven (see `application.yml`); sensible dev
defaults are baked in so nothing is required to just run it locally. For anything beyond
local dev, set at minimum:

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | HMAC signing key for access tokens (256-bit minimum) |
| `SPRING_DATASOURCE_URL` / `_USERNAME` / `_PASSWORD` | Postgres connection |
| `STRIPE_API_KEY` | Stripe **test-mode** secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` (see below) or your Stripe Dashboard webhook config |

## Testing Stripe payments locally

Payment creation calls the real Stripe API in test mode, so you need a genuine test-mode
secret key in `STRIPE_API_KEY` to create a PaymentIntent. To receive the webhook callback
that marks a payment SUCCEEDED/FAILED, forward Stripe's events to your local server with
the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:8080/api/v1/payments/webhook/stripe
```

`stripe listen` prints a webhook signing secret (`whsec_...`) the first time it runs --
set that as `STRIPE_WEBHOOK_SECRET`.

Without a Stripe key configured, everything except the actual PaymentIntent creation call
still works and is covered by tests: ownership checks, idempotency-key handling, and the
full webhook signature-verification path are all exercised with a mocked Stripe gateway.

## Running tests

```bash
./mvnw verify
```

Runs both the unit test suite (Surefire: state machines, JWT handling, maintenance
evaluation logic) and the integration suite (Failsafe: `*IT` classes, each spinning up a
real Postgres via Testcontainers and exercising the API through MockMvc). Requires Docker
to be running. `./mvnw test` runs only the unit tests, no Docker required.

## CI/CD

`.github/workflows/ci.yml` runs `./mvnw -B verify` (unit + integration tests) on every push
and PR to `main`, then builds the Docker image (build-only -- no registry push is
configured). Deploying the built image to a host (Render, Fly.io, Railway, etc.) is a
manual step: point the platform at this repo's `Dockerfile`, provision a managed Postgres
instance, and set `SPRING_DATASOURCE_URL`, `JWT_SECRET`, `STRIPE_API_KEY`, and
`STRIPE_WEBHOOK_SECRET` as platform secrets.

## API surface

Full endpoint list and request/response shapes are in Swagger UI
(`/swagger-ui.html`) once the app is running, or `/v3/api-docs` for the raw OpenAPI JSON.
