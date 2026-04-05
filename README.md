# ezeeFlights

Enterprise-ready, AI-powered Online Travel Agency (OTA) platform with a modular-monolith foundation and a microservices-ready evolution path.

## What this repository contains

- **Frontend**: Next.js + TypeScript + Tailwind + React Query + Zustand.
- **Backend**: NestJS + PostgreSQL + Redis with layered modules.
- **Infrastructure**: Docker-based local runtime and CI/CD workflow scaffold.
- **Data model**: PostgreSQL schema for users, flights, hotels, bookings, payments, trips, and reviews.

---

## Monorepo layout

```text
.
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # Next.js web app
├── docs/                 # Architecture/API/Auth docs
├── infra/                # Docker + AWS deployment notes
├── sql/                  # PostgreSQL schema
├── .github/workflows/    # CI/CD
├── .env.example
└── package.json
```

---

## Architecture highlights

- Clean architecture layering in backend modules:
  - **Controller** -> **Service** -> **Repository** -> **Entity**
- Feature modules:
  - `auth`, `flight`, `hotel`, `booking`, `user`, `payment`, `ai`
- API versioning via URI: `/v1/...`
- Swagger docs at `/docs`
- JWT + OAuth-ready auth foundation
- Redis-ready caching/session foundation

---

## Development Guide

## 1) Prerequisites

Install the following locally:

- Node.js 20+
- npm 10+
- Docker + Docker Compose

Optional but recommended:

- psql client for direct DB checks
- Redis CLI (`redis-cli`)

## 2) Environment setup

Create your local environment file:

```bash
cp .env.example .env
```

Then update values as needed (JWT secret, OAuth, OpenAI key, etc.).

## 3) Install dependencies

Install dependencies for each app:

```bash
cd apps/backend && npm install
cd ../frontend && npm install
```

Or from repo root, if you prefer workspace tooling:

```bash
npm install
```

## 4) Run with Docker (recommended)

From repository root:

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/docs`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## 5) Run without Docker (local process mode)

Start backend:

```bash
cd apps/backend
npm run dev
```

Start frontend in another terminal:

```bash
cd apps/frontend
npm run dev
```

## 6) Database initialization

The Docker PostgreSQL service auto-runs `sql/schema.sql` on first startup.

For manual setup:

```bash
psql "$DATABASE_URL" -f sql/schema.sql
```

## 7) Testing and quality checks

Backend unit tests:

```bash
cd apps/backend
npm test
```

Backend build:

```bash
npm run build
```

Frontend build:

```bash
cd apps/frontend
npm run build
```

## 8) API usage quick reference

- Flight search:
  - `GET /v1/flights/search?origin=DXB&destination=LHR&departureDate=2026-10-01&page=1&limit=20`
- Flight detail (JWT protected):
  - `GET /v1/flights/:id`
- Login:
  - `POST /v1/auth/login`

## 9) Branching and contribution workflow

Recommended flow:

1. Create a feature branch from `develop`.
2. Implement changes in small, reviewable commits.
3. Run tests/build locally.
4. Open PR with architecture notes and rollout impact.
5. Merge to `develop`, promote to `main` via release process.

## 10) Production-hardening checklist (next steps)

- Replace mock auth checks with hashed password verification (bcrypt/argon2).
- Add migrations (e.g., Prisma/TypeORM migrations or Flyway).
- Add observability: structured logs, tracing, metrics.
- Add centralized secrets manager (AWS Secrets Manager/SSM).
- Add idempotency for payment/booking workflows.
- Add circuit breakers/retries for external provider integrations.
- Expand test pyramid: integration + e2e.

---

## CI/CD

The repository includes `.github/workflows/ci-cd.yml` with:

- install
- test
- build
- deploy placeholder for AWS/EC2 on `main`

---

## Documentation index

- `docs/architecture.md`
- `docs/api-endpoints.md`
- `docs/auth-flow.md`
- `infra/aws/README.md`
