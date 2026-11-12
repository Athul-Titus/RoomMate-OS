# ADR 001 — Email + password auth for MVP (OTP deferred)

**Date:** 2026-11-12
**Status:** Accepted

## Context

The plan specifies OTP (phone or email) as the primary auth method. OTP requires an external SMS or email provider, adds latency to the sign-up flow, and complicates local development.

## Decision

Use email + password for the initial MVP. The email sending capability is wrapped behind an `EmailAdapter` interface. A `ConsoleEmailAdapter` is used in local dev (logs to stdout). A real provider (Resend) can be plugged in for staging/prod without changing business logic.

The auth service is structured so that OTP paths can be added alongside password auth in a future phase without breaking existing users.

## Consequences

- Faster local development setup.
- No external provider dependency for Phase 1.
- Password hashing (bcrypt, cost factor 12) handles security.
- OTP can be added in Phase 2 with minimal refactoring.

---

# ADR 002 — OpenStreetMap + Nominatim for geocoding

**Date:** 2026-11-12
**Status:** Accepted

## Context

Property and neighbourhood lookup needs geocoding. Options: Google Maps (accurate, paid), MapMyIndia (India-focused, requires signup), OpenStreetMap + Nominatim (free, open).

## Decision

Use Nominatim for MVP geocoding. Wrap behind a `GeocodingAdapter` interface. For Phase 1, use text-based neighbourhood input (no geocoding needed). Nominatim integration added in Phase 3 for property coordinates.

## Consequences

- Zero cost during development and early testing.
- Nominatim has rate limits (1 req/sec per Nominatim usage policy) — the adapter enforces this.
- Can be swapped for Google Maps or MapMyIndia without changing business logic.

---

# ADR 003 — PostgreSQL + PostGIS for all data

**Date:** 2026-11-12
**Status:** Accepted

## Context

Property and neighbourhood proximity queries need geospatial support.

## Decision

Use PostgreSQL 16 with PostGIS extension for all data. PostGIS handles proximity queries (`ST_DWithin`), neighbourhood boundary lookups, and approximate location storage.

## Consequences

- Single database for all data reduces operational complexity.
- PostGIS is well-supported on managed services (RDS, Cloud SQL, Supabase).
- Must enable PostGIS extension in RDS parameter group before first migration.

---

# ADR 004 — Next.js web app before React Native mobile

**Date:** 2026-11-12
**Status:** Accepted

## Context

Building both simultaneously increases risk and complexity. The form-heavy onboarding and group workflows iterate faster on web.

## Decision

Build Next.js web app first (Phase 1-3). React Native mobile app starts in Phase 4 after core flows are validated.

## Consequences

- Faster time to first usable product.
- Mobile users must use the web app via mobile browser initially.
- Shared types and API client packages designed from the start to support both.

---

# ADR 005 — AWS for production hosting

**Date:** 2026-11-12
**Status:** Accepted

## Context

Production deployment needs managed Postgres with PostGIS, Redis, S3-compatible storage, and container hosting.

## Decision

Target AWS for production: ECS Fargate, RDS, ElastiCache, S3, CloudFront, Route 53, ACM.

## Consequences

- Strong PostGIS support on RDS.
- Higher operational cost than Railway/Render.
- More control over security, networking, and scaling.
- Can be migrated to GCP or Azure if needed — Docker-based deployment is portable.
