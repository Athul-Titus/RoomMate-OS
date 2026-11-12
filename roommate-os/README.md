# ROOMMATE OS

> **More than a room. Better people to live with.**

A people-first shared-rental platform for working professionals in India. Connects compatible people, helps them form groups, discover suitable homes, and manage the shared-living journey from discovery to move-out.

---

## Repository structure

```
roommate-os/
  apps/
    web/          Next.js 14 — App Router, TypeScript
    mobile/       React Native + Expo (Phase 2+)
  backend/        Python 3.12 + FastAPI modular monolith
  packages/
    design-tokens/   Shared design tokens (CSS + JSON)
    shared-types/    Shared TypeScript types
    api-client/      Typed API client
  docs/           Architecture, API conventions, security notes
  infra/          Docker and deployment configs
  .github/        CI/CD workflows
```

---

## Quick start (local development)

### Prerequisites

- Docker Desktop 4.x+
- Node.js 20+
- Python 3.12+
- pnpm 9+

### 1. Clone and configure

```bash
git clone <repo-url>
cd roommate-os
cp .env.example .env
# Edit .env — fill in SECRET_KEY (see comment in file)
```

### 2. Start infrastructure

```bash
docker compose up postgres redis minio -d
```

### 3. Run backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -e ".[dev]"
alembic upgrade head
python scripts/seed_dev.py        # loads fictional demo data only
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 4. Run web app

```bash
cd apps/web
pnpm install
pnpm dev
```

Web app available at: http://localhost:3000

---

## Environment variables

See [`.env.example`](.env.example) for all required variables with descriptions.

Never commit a `.env` file. Never put real secrets in source control.

---

## Pilot cities

Initial pilot: **Bengaluru**
Planned expansion: Kochi, Trivandrum

---

## Status

Phase 0 — Engineering foundation in progress.

---

## Legal

This platform does not hold deposits or rent. It does not provide legal advice. Rental agreements recorded in the platform are user-uploaded documents; the platform does not guarantee their enforceability.

See Privacy Policy and Terms of Service in the web app.

