# CarPlatform Frontend

A React + TypeScript UI for the [CarPlatform](../README.md) API — a demoable client that
exercises every endpoint across all three roles (customer, fleet agent, admin): browsing
and booking vehicles, activating/completing/cancelling reservations, logging maintenance
and dismissing alerts, and admin management of locations, users, and maintenance rules.

Vite + TypeScript, Tailwind CSS, TanStack Query + Axios, React Router. No backend changes
were made to build this — it's purely an additive client.

## Setup

```bash
npm install
npm run dev
```

Requires the backend running separately on `http://localhost:8080` (`./mvnw spring-boot:run`
from the repo root, `dev` profile, which is the default). The Vite dev server proxies
`/api/*` to the backend, so the app runs same-origin — no `CORS_ALLOWED_ORIGINS` change
needed on the backend.

Opens on `http://localhost:5173`.

`npm run build` type-checks (`tsc -b`) and produces a production bundle.

## Demo accounts

Seeded by the backend's `dev` profile, password `password123` for all:

| Email | Role | Location |
|---|---|---|
| `admin@carplatform.dev` | Admin | — (all locations) |
| `agent.downtown@carplatform.dev` | Fleet Agent | Downtown Austin |
| `agent.airport@carplatform.dev` | Fleet Agent | Austin Airport |
| `customer@carplatform.dev` | Customer | — |

Or register a new account from `/register` (always created as Customer).

## Manual demo script

**Anonymous** — visit `/vehicles`, filter by location/status/tier, open a vehicle's detail
page and check live availability for a date range.

**Customer** (`customer@carplatform.dev`) — browse to a vehicle, pick dates, confirm the
booking. On the reservation's detail page, click **Pay Now**: this environment has no
Stripe key configured, so the payment is expected to come back **Failed** — that's the
real `PAYMENT_GATEWAY_ERROR` path, not a bug, and the UI says so. Cancel a different
`RESERVED` booking from **My Reservations**.

**Fleet agent** (`agent.downtown@carplatform.dev`) — **Fleet Vehicles** is scoped to your
location by default; switch the location filter to Austin Airport to see cross-location
rows render as read-only ("Different location"). Add or edit a vehicle, change its status.
Under **Reservations**, activate a `RESERVED` booking, then complete the now-`ACTIVE` one
(enter an ending mileage). Log a maintenance record from a vehicle's **Maintenance** link.
Check **Maintenance Alerts** and **Maintenance Rules** (read-only for this role).

**Admin** (`admin@carplatform.dev`) — same fleet/reservation/maintenance views as a fleet
agent, but unscoped across every location. Additionally: **Users** to create a new fleet
agent (assign them a location), **Locations** to add/edit/deactivate one, and edit an
interval on **Maintenance Rules**.

## Project structure

- `src/types/` — TypeScript mirrors of every backend DTO and enum
- `src/api/` — one file per backend resource; thin Axios wrapper functions
- `src/hooks/` — TanStack Query hooks (`useQuery`/`useMutation`) built on `src/api/`
- `src/context/AuthContext.tsx` — session state (tokens + user), persisted to `localStorage`
- `src/components/` — shared UI kit (`ui/`), a generic paginated `DataTable` (`data/`), and
  route guards (`guards/`)
- `src/features/` — one folder per feature area (`auth`, `vehicles`, `reservations`,
  `maintenance`, `payments`, `locations`, `users`, `admin`)

## Known limitations (by design)

- **No vehicle photos** — the backend has no image upload endpoint, so vehicle cards use
  gradient tiles color-coded by pricing tier instead of photos.
- **Payments always fail** — without a real Stripe key on the backend, `POST /payments`
  reaches Stripe and fails; the UI surfaces this as an expected, explained outcome rather
  than hiding the flow.
- **Tokens in `localStorage`** — a deliberate simplification for a local demo app (survives
  reloads, no silent-refresh-on-boot complexity). A production app would prefer httpOnly
  cookies or in-memory tokens with silent refresh.
