# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three roles, each with a distinct job inside the same product:

- **Customer** — browses available vehicles across locations, books a date range, pays for a
  reservation, and manages/cancels their own bookings.
- **Fleet Agent** — manages the vehicle inventory, reservations, and maintenance for a single
  assigned location (server-enforced location scoping — they cannot act on another location's
  fleet).
- **Admin** — the same fleet/reservation/maintenance operations as a Fleet Agent, but unscoped
  across every location, plus user and location management.

The product is both an in-fiction operations tool for those three roles and a portfolio
artifact: real engineers, recruiters, and reviewers are the actual audience evaluating it as a
demonstration of production-grade full-stack engineering.

## Product Purpose

A backend-driven multi-location car rental operations platform: vehicle fleet management,
customer-facing booking with real availability guarantees, Stripe-backed payments, and
automated maintenance scheduling. Success is a system that behaves like a real rental
operation would need to — correct under concurrency, safe under retries, properly scoped by
role and location — not a CRUD demo that only looks the part.

## Positioning

What a superficially similar CRUD rental app could not truthfully claim:

- Double-booking is prevented by a database-level exclusion constraint, not just an
  application check — it holds under concurrent requests.
- Payments are idempotency-safe end-to-end (client key → Stripe's own idempotency key → a
  unique DB constraint), so a retried request can't double-charge.
- Maintenance alerts are evaluated automatically (scheduled sweep + on reservation completion)
  and deduplicated.
- Role and location authorization is enforced at the data layer, not just the API layer — a
  fleet agent cannot touch another location's fleet even if the UI were bypassed.

As a portfolio piece, the positioning is: this is what a rental platform looks like when it's
built to the standard of a real operation, not a tutorial project.

## Operating Context

Runs entirely locally for demo/dev purposes: Spring Boot backend on `localhost:8080` (Docker
Compose-managed Postgres, `dev` profile auto-seeds accounts/locations/vehicles), React/Vite
frontend on `localhost:5173` (dev-proxied to the backend, no CORS config needed). No production
deployment exists yet. Demo accounts (password `password123`): an Admin, two location-scoped
Fleet Agents (Downtown Austin, Austin Airport), and a Customer — or a visitor can self-register
as a Customer.

## Capabilities and Constraints

- No image upload endpoint on the backend — vehicle visuals must be generated client-side
  (currently gradient tiles by pricing tier), not photos.
- Payments reach the real Stripe API in test mode; without a configured Stripe key in this
  local environment, `POST /payments` correctly resolves to `FAILED` — this is the real
  `PAYMENT_GATEWAY_ERROR` path and must read as an explained, expected state, not a broken one.
  A production deployment with a real key would see this path succeed instead.
- Auth tokens are held in browser `localStorage`, a deliberate simplification for a local demo
  (survives reloads, no silent-refresh-on-boot complexity) rather than httpOnly cookies.
- Pricing tiers: Economy, Standard, Premium, Luxury. Vehicle statuses: Available, Rented, In
  Maintenance, Out of Service, Retired. Reservation states: Reserved → Active → Completed, or
  Cancelled from Reserved/Active.
- Only two seeded locations and three seeded vehicles exist in this environment — the UI
  should present convincingly at this small scale without implying a larger fleet than exists.

## Brand Commitments

Renaming from the placeholder engineering name "CarPlatform" to **MyDrive** as part of this
redesign. No existing logo, wordmark, or visual identity yet — this redesign is establishing
the brand's visual identity for the first time, not preserving one.

## Evidence on Hand

- Real, working backend and seed data: 2 locations (Downtown Austin, Austin Airport), 3
  vehicles (Toyota Camry, Honda Civic, BMW 5 Series), 4 demo accounts.
- No real customer testimonials, press, case studies, or pricing beyond the seeded dev data —
  none should be fabricated; where a real platform might show social proof, this one should
  either omit it or clearly frame seeded data as a live demo, not real business evidence.
- Root `README.md` and `frontend/README.md` document the full feature set and manual demo
  script — reliable source of truth for what functionality must remain reachable through the
  UI after the redesign.

## Product Principles

1. **Backend guarantees should be visible, not just true.** Correctness features (no
   double-booking, idempotent payments, deduplicated alerts) are the product's real
   differentiation — the UI should make users trust the system is solid, not undercut a solid
   backend with a flimsy-feeling frontend.
2. **Three roles, three purpose-built experiences.** Customer, Fleet Agent, and Admin should
   each feel designed for their job, not like one generic admin panel reskinned by permission
   check.
3. **Honest about known limitations.** Expected-but-constrained states (payments failing
   without a Stripe key, no vehicle photos, small seeded fleet) should read as intentional and
   explained, never as bugs or an unfinished build.
4. **Portfolio-grade craft is a functional requirement, not decoration.** Since real engineers
   and reviewers are part of the actual audience, visual polish and professional presentation
   carry as much weight as feature completeness.
5. **Make the multi-location model tangible.** Location scoping is a core architectural
   decision (schema-level, not bolted on) — fleet/admin views should make that model visible
   and understandable, not hide it behind a generic filter.
