# Phase 3 Design: Groups, Properties & Admin Portal
**Date:** 2026-11-19  
**Project:** Roommate OS — Pilot: Kochi (Kakkanad & Infopark IT corridor)  
**Status:** Awaiting builder check

---

## Intent and Why

After Phase 2, two matched users can chat. But the product stops there — there's nowhere to go. Phase 3 closes the loop: matched users can form a named group, browse real property listings, and shortlist flats together. Platform operators get an admin portal to approve listings and manage the community. This makes Roommate OS a usable end-to-end product for the Kakkanad IT corridor pilot.

---

## Goals

- Users can create a group from a mutual match and invite other matched users into it
- Any registered user can submit a property listing (room vacancy or entire flat)
- Listings require admin approval before appearing publicly
- Groups can shortlist/bookmark properties they like
- Platform admin can approve listings, manage users, and review moderation reports from a dedicated `/admin` portal
- Seed realistic Kakkanad/Infopark property data for demo use

## Non-Goals

- Groups formally "applying" to a property — deferred to Phase 4
- Landlord-specific account type — any user can post a listing (moderated)
- Payment, deposit, or tenancy agreement flows — Phase 4+
- Multi-city rollout — Kochi only for Phase 3

## Anti-Goals

- The admin portal must NOT be publicly discoverable — no link from the main nav
- Listings must NOT go live without admin approval — no self-publishing
- No fake occupancy stats, "X groups viewing this", or artificial urgency signals
- Platform must NEVER imply it facilitates or guarantees the rental transaction

---

## Constraints

- Python 3.14 — passlib incompatible; use native `bcrypt` (already in place)
- SQLAlchemy async + asyncpg — no sync ORM calls anywhere
- Pydantic v2 — `model_validate`, not `.from_orm()`
- Existing stack: FastAPI + PostgreSQL 16 (PostGIS) + Redis 7 + Next.js 14 + TypeScript + TailwindCSS
- Design rules: no purple gradients, rectangular buttons only (max 6px radius), Lucide icons only, no emoji as icons, no fake metrics
- Admin portal protected by a separate env-var credential (`ADMIN_EMAIL` + `ADMIN_PASSWORD`), not a user role in the DB (keeps it simple for MVP)

---

## Approaches Considered

### A. Full group-application flow (rejected)
Groups can formally apply to listings; landlords see applicant profiles and accept/reject. More complete but doubles the scope and requires landlord account management, notification emails, and application state machines. Too large for Phase 3.

### B. Shortlist only — groups bookmark properties, no formal application (chosen)
Groups maintain a shortlist of properties they're interested in. No application state, no landlord-side UI. Simpler, still useful — the group can go contact the landlord directly (phone/email shown on listing). Keeps Phase 3 shippable.

### C. No group-property link at all
Groups exist but can't interact with listings at all. Too minimal — doesn't complete the core user journey.

**Chosen: B.** Shortlist only. Formal applications deferred to Phase 4.

---

## The How

### Backend — New Modules

#### `backend/app/modules/groups/`

**Models:**
- `Group` — id, name, description, created_by (FK→users), created_at
- `GroupMember` — group_id (FK→groups), user_id (FK→users), role (enum: `admin`, `member`), joined_at
- `GroupInvite` — id, group_id, invited_by, invited_user_id, status (enum: `pending`, `accepted`, `declined`), created_at

**Business rules:**
- Creator of a group automatically becomes the `admin` member
- Only group admin can invite or remove members
- A user can be in multiple groups
- Invite to a user who is already a member → 409 error
- Group with 0 members after last person leaves → group is deleted (or archived — builder's call)

**Endpoints (`/api/v1/groups`):**
- `POST /` — create group (name, description)
- `GET /` — list my groups
- `GET /{id}` — get group detail + members
- `POST /{id}/invite` — invite user (admin only)
- `POST /{id}/invite/{invite_id}/respond` — accept/decline invite
- `DELETE /{id}/members/{user_id}` — remove member (admin only, cannot remove self if last admin)
- `DELETE /{id}` — delete group (admin only)

#### `backend/app/modules/properties/`

**Models:**
- `PropertyListing` — id, posted_by (FK→users), listing_type (enum: `room_vacancy`, `entire_flat_for_group`), title, description, address, neighbourhood_id (FK→neighbourhoods), rent_per_month (integer, INR), deposit (integer, INR), bedrooms, bathrooms, furnishing (enum: `unfurnished`, `semi_furnished`, `fully_furnished`), available_from (date), status (enum: `pending_review`, `active`, `rejected`, `archived`), admin_note, created_at, updated_at
- `ListingPhoto` — id, listing_id (FK→property_listings), url, display_order
- `GroupShortlist` — group_id (FK→groups), listing_id (FK→property_listings), added_by (FK→users), added_at — PK is (group_id, listing_id)

**Business rules:**
- New listing → status = `pending_review` automatically
- Only admin can set status to `active` or `rejected`
- Poster can archive their own listing (status → `archived`) but cannot re-activate
- Only `active` listings are visible to regular users
- Photos: max 8 per listing; builder decides storage strategy (URL-only for MVP is fine)
- Shortlist: any group member can add/remove a property from group shortlist

**Endpoints (`/api/v1/properties`):**
- `POST /` — create listing (authenticated user)
- `GET /` — list active listings (public, with filters: type, neighbourhood, min/max rent, furnishing, bedrooms)
- `GET /{id}` — get listing detail (public if active, or owner, or admin)
- `PATCH /{id}` — update listing (owner only, only while `pending_review`)
- `DELETE /{id}` — archive listing (owner) or hard delete (admin)

**Shortlist endpoints (`/api/v1/groups/{id}/shortlist`):**
- `POST /` — add listing to group shortlist (body: `{ listing_id }`)
- `GET /` — list group's shortlisted properties
- `DELETE /{listing_id}` — remove from shortlist

#### `backend/app/modules/admin/`
Admin endpoints protected by HTTP Basic Auth using env vars `ADMIN_EMAIL` + `ADMIN_PASSWORD`. No DB user record needed.

**Endpoints (`/api/v1/admin`):**
- `GET /listings?status=pending_review` — list listings by status
- `PATCH /listings/{id}/status` — set status + optional admin_note (approve/reject)
- `GET /users` — list all users with profile summary
- `DELETE /users/{id}` — deactivate user (soft delete: `is_active=False`)
- `GET /reports` — list moderation reports (from Phase 2 moderation module)
- `PATCH /reports/{id}/resolve` — mark report resolved with resolution note

### Frontend — New Pages

All under `apps/web/src/app/`:

- `(protected)/groups/page.tsx` — My groups list + "Create Group" button
- `(protected)/groups/[id]/page.tsx` — Group detail: member list, invite button, shortlisted properties
- `(protected)/groups/new/page.tsx` — Create group form
- `(protected)/properties/page.tsx` — Browse active listings (filterable)
- `(protected)/properties/[id]/page.tsx` — Listing detail: photos, details, "Add to Group Shortlist" button
- `(protected)/properties/new/page.tsx` — Post a listing form (goes to pending_review)
- `admin/page.tsx` — Admin login (Basic Auth credentials form → stored in sessionStorage)
- `admin/listings/page.tsx` — Pending listing review queue + approve/reject
- `admin/users/page.tsx` — User list + deactivate
- `admin/reports/page.tsx` — Moderation report list + resolve

**Admin portal:** separate layout, no main Navbar, no link from user-facing nav. Admin "auth" is just the HTTP Basic Auth header sent with every request to `/api/v1/admin/*`.

### Seed Data

`backend/scripts/seed_phase3.py`:
- 5 property listings in Kakkanad/Infopark area (mix of room vacancy and full flat)
- Realistic 2BHK/3BHK pricing: ₹14,000–₹28,000/mo
- Neighbourhoods: Infopark Phase 1, SmartCity, Kakkanad
- Status: 3 `active`, 1 `pending_review`, 1 `rejected` (for admin demo)

---

## What's Left to the Builder

- Exact column-level DB indexes (beyond FK indexes)
- Pagination strategy for listing endpoints (cursor vs offset — either is fine)
- Photo storage: URL-only strings for MVP (no S3 upload in Phase 3)
- Group deletion vs archival when last member leaves
- Exact Tailwind styling for property cards (follows existing design system)
- Error message copy for edge cases

