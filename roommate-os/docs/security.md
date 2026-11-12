# Security Notes — ROOMMATE OS

> Updated: 2026-11-12
> This is an internal reference, not a public document.

---

## Authentication

- Passwords hashed with bcrypt (cost factor 12).
- JWT signed with HS256, secret from environment only.
- Access token lifetime: 15 minutes.
- Refresh token: SHA-256 hashed before storage, 7-day lifetime.
- Refresh token rotation: on each use, old token is revoked and a new one is issued.
- On logout: refresh token revoked, httpOnly cookie cleared.
- Account enumeration: auth endpoints return identical errors for wrong email vs. wrong password.
- Brute force: rate limiting on login (10 per IP per 15 min), lockout consideration for sustained attacks.

## Authorization

Every protected route verifies both authentication and authorization in the service layer.

**Checks enforced server-side (never UI-only):**
- User can edit only their own profile.
- Group member can view only permitted group information.
- Only creator/admin can change group settings.
- Vote can only be submitted or updated by the voting user themselves.
- Private documents accessible only to permitted tenancy members.
- Property owners/managers can edit only listings they control.
- Admin actions require `is_admin = true` and are logged.

## Sensitive data

- Phone numbers: never exposed in public API responses.
- Exact property addresses: not visible until appropriate stage (enquiry accepted or tenancy formed).
- Identity documents: private object storage only, short-lived signed URLs, never in DB.
- OTPs: stored as bcrypt hash, expire in 10 minutes, rate-limited.
- Messages: not logged in audit logs, not exposed in analytics events.
- Passwords: never logged, never returned in API responses.

## Object storage

- Private bucket: all user documents, identity documents, tenancy documents.
- Public bucket: only content explicitly intended for public access (none in MVP).
- Pre-signed URLs: 15-minute expiry for private files.
- Uploaded files: MIME type validated server-side (not based on client Content-Type alone).
- File size limits: 10 MB for photos, 25 MB for documents.

## Input validation

- All request bodies validated with Pydantic v2 schemas before reaching service layer.
- SQL injection: prevented by SQLAlchemy parameterized queries (no raw string interpolation).
- Stored content sanitized where rendered as HTML.
- Sort fields and filter fields allowlisted on every list endpoint.
- UUID path params validated as valid UUID format.

## Audit logging

Logged to `audit_logs` table (never to stdout logs):
- `user_registered`
- `user_logged_in`
- `user_suspended`
- `profile_updated` (field names only, not values)
- `group_member_added`
- `group_member_removed`
- `report_submitted`
- `report_resolved`
- `admin_action` (all admin operations)

**Never log:** passwords, OTPs, access tokens, document contents, message bodies.

## CORS

Allowed origins configured via environment variable. Default in local dev: `http://localhost:3000`. Never use `*` in production.

## Headers set on all responses

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

## India-specific compliance (pre-launch review required)

Before public launch, obtain qualified legal review for:
- Digital Personal Data Protection Act 2023 and its rules
- Consumer protection obligations
- State tenancy and rental regulations
- KYC/identity verification provider compliance
- Payment provider and RBI-related requirements (if payments added)
- Grievance handling and redressal officer requirement
- Data retention and cross-border storage

**This file is an engineering reference, not legal advice.**
