# Architecture — ROOMMATE OS

> Status: Phase 1 — Engineering Foundation
> Updated: 2026-11-12

---

## Overview

ROOMMATE OS is a **modular monolith** built on FastAPI (Python) with a Next.js web front end and a React Native mobile app (Phase 2+). The monolith has clear module boundaries that allow future extraction into services if warranted.

---

## High-level diagram

```
Users
 ├── Next.js Web (apps/web)       → HTTP + WS
 └── React Native App (apps/mobile) [Phase 2+]
         │
         ▼
 FastAPI API (backend/app)
  ├── /api/v1/auth
  ├── /api/v1/profiles
  ├── /api/v1/discovery        [Phase 2]
  ├── /api/v1/matches          [Phase 2]
  ├── /api/v1/messaging        [Phase 2]
  ├── /api/v1/groups           [Phase 3]
  ├── /api/v1/properties       [Phase 3]
  └── /api/v1/admin
         │
    ┌────┴────────────────┐
    │                     │
 PostgreSQL 16        Redis 7
 + PostGIS            (sessions, rate limits,
                       background job queues)
         │
   Private Object Storage (MinIO local / S3 prod)
   Maps adapter (Nominatim / OSM)
   Email adapter (console local / Resend prod)
```

---

## Module boundaries

Each module under `backend/app/modules/` follows the same internal structure:

```
modules/<name>/
  models.py       SQLAlchemy ORM models (source of truth for schema)
  schemas.py      Pydantic v2 request/response schemas
  repository.py   Async data access — no business logic
  service.py      Business logic — no direct DB calls (uses repository)
  router.py       FastAPI routes — no business logic (delegates to service)
  permissions.py  Module-specific permission checks (optional)
  tests/          Module tests
```

**Rules:**
- Modules do not directly access another module's database tables.
- Cross-module communication goes through service methods or domain events (not direct DB queries).
- No circular imports.

---

## Authentication flow (Phase 1 — email + password)

```
Client                     API                        DB
  │                         │                          │
  │  POST /auth/register    │                          │
  │─────────────────────── ▶│                          │
  │                         │  hash password           │
  │                         │  INSERT users            │──▶ users
  │                         │  INSERT user_profiles    │──▶ user_profiles
  │                         │  issue JWT + refresh     │
  │                         │  INSERT refresh_tokens   │──▶ refresh_tokens (hash only)
  │◀─────────────────────── │                          │
  │  access_token (body)    │                          │
  │  refresh_token (cookie, httpOnly)                  │
  │                         │                          │
  │  GET /auth/me (Bearer)  │                          │
  │─────────────────────── ▶│                          │
  │                         │  decode JWT              │
  │                         │  SELECT users WHERE id   │──▶ users
  │◀─────────────────────── │                          │
  │  { id, email, ... }     │                          │
```

**Token strategy:**
- Access token: JWT, 15-minute expiry, in-memory or localStorage client-side
- Refresh token: JWT opaque reference, 7-day expiry, stored as SHA-256 hash in DB, delivered via httpOnly cookie
- Logout: revokes refresh token hash in DB, clears cookie

**Future OTP path:** Add `otp_requests` table and `OTPEmailAdapter`. Auth service gains a `request_otp` / `verify_otp` path. Existing email+password path remains unchanged.

---

## Database conventions

| Convention | Rule |
|---|---|
| Primary keys | UUID (`gen_random_uuid()` server default) |
| Timestamps | `TIMESTAMPTZ` stored UTC |
| Money | `NUMERIC(14, 2)` never `FLOAT` |
| Currency | Stored explicitly, default `INR` |
| Soft deletes | Only where justified; define retention |
| Sensitive files | Object storage keys in DB, never file contents |
| OTPs / passwords | Hashed only, never plaintext |
| Exact addresses | Encrypted column or separate access-controlled table |

---

## Security model

| Layer | Control |
|---|---|
| Transport | HTTPS in staging/prod (TLS terminated at load balancer) |
| Auth | JWT Bearer token, validated on every protected route |
| Authorization | Server-side per-resource checks in service layer |
| Rate limiting | Redis sliding window on auth, messaging, reports |
| File access | Private bucket + short-lived signed URLs |
| Audit | `audit_logs` table for sensitive actions |
| Secrets | Environment variables only, never in source code |

---

## Infrastructure (local dev vs. production)

| Component | Local (Docker Compose) | Production (AWS/GCP/Azure) |
|---|---|---|
| Postgres | `postgis/postgis:16-3.4-alpine` | Managed RDS / Cloud SQL with PostGIS |
| Redis | `redis:7-alpine` | ElastiCache / Memorystore |
| Object storage | MinIO | S3 / GCS |
| Container runtime | Docker Compose | ECS / Cloud Run / AKS |
| CDN | None | CloudFront / Cloud CDN (public assets only) |
| Secrets | `.env` file | AWS Secrets Manager / GCP Secret Manager |
| Email | Console adapter (stdout) | Resend / SendGrid |

---

## API conventions

- Base path: `/api/v1`
- Auth: `Authorization: Bearer <access_token>`
- Success: `{"data": {...}, "meta": {"request_id": "uuid", "timestamp": "..."}}`
- Error: `{"error": {"code": "RESOURCE_FORBIDDEN", "message": "...", "request_id": "uuid"}}`
- Pagination: `?page=1&page_size=20`, response includes `meta.total`, `meta.page`, `meta.page_size`
- Never return stack traces to clients
- Request ID: generated per request, returned in `X-Request-ID` header

