# API Conventions — ROOMMATE OS

> Version: v1
> Updated: 2026-11-12

---

## Base path

All API routes: `/api/v1/`

---

## Authentication

Protected routes require:
```
Authorization: Bearer <access_token>
```

The access token is a JWT issued by `POST /auth/login` or `POST /auth/register`.
Tokens expire in 15 minutes. Use `POST /auth/refresh` (with the httpOnly refresh token cookie) to get a new access token.

---

## Standard response shapes

### Success

```json
{
  "data": { ... },
  "meta": {
    "request_id": "019019ba-1234-7abc-8def-123456789abc",
    "timestamp": "2026-11-12T10:00:00Z"
  }
}
```

For lists:
```json
{
  "data": [ ... ],
  "meta": {
    "request_id": "...",
    "timestamp": "...",
    "page": 1,
    "page_size": 20,
    "total": 143
  }
}
```

### Error

```json
{
  "error": {
    "code": "RESOURCE_FORBIDDEN",
    "message": "You do not have permission to access this resource.",
    "request_id": "019019ba-1234-7abc-8def-123456789abc"
  }
}
```

---

## Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Authenticated but not permitted |
| `NOT_FOUND` | 404 | Resource does not exist or is not visible |
| `CONFLICT` | 409 | Duplicate resource or state conflict |
| `VALIDATION_ERROR` | 422 | Invalid request body or params |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

Never return stack traces. Never return internal exception messages.

---

## Pagination

Query params: `?page=1&page_size=20`
- Default `page_size`: 20
- Max `page_size`: 100
- Out-of-range page returns empty `data` array, not 404.

---

## Filtering and sorting

- Filter params are allowlisted per endpoint.
- Sort fields are allowlisted — do not allow arbitrary column names.
- Example: `?sort=created_at&order=desc`

---

## Rate limits

| Endpoint group | Limit |
|---|---|
| `POST /auth/register` | 5 per IP per hour |
| `POST /auth/login` | 10 per IP per 15 minutes |
| `POST /auth/refresh` | 30 per user per hour |
| `POST /reports` | 20 per user per hour |
| Messaging | 60 messages per user per minute |

Rate limit responses include `Retry-After` header.

---

## File uploads

- Never send file content in JSON body.
- Use multipart/form-data for direct uploads, or request a pre-signed URL from the storage endpoint.
- Validate MIME type and file size server-side.
- Max photo size: 10 MB.
- Accepted types: `image/jpeg`, `image/png`, `image/webp`.

---

## Idempotency

Write operations that may be retried accept an optional `Idempotency-Key: <uuid>` header. The server caches the result for 24 hours keyed by this value.

---

## Versioning

Breaking changes increment the version: `/api/v2/`. Non-breaking additions are made in-place. Deprecated fields are marked in schema docs before removal.

---

## OpenAPI docs

Available at `/docs` (Swagger UI) and `/redoc` in local and staging environments. Disabled in production.

