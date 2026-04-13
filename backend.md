# Backend — Local Development Guide

NestJS API running on **http://localhost:4000**

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | Comes with Node |
| PostgreSQL | 14+ | Must be running locally |
| Redis | 6+ | Optional — falls back to in-memory cache if missing |

---

## 1. Install dependencies

From the **repo root**:

```bash
npm install
```

Or from the backend directory:

```bash
cd apps/backend
npm install
```

---

## 2. Set up the database

Create the database in PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE ezeeflights;"
```

Apply the schema (all SQL files in `sql/`):

```bash
psql -U postgres -d ezeeflights -f sql/schema.sql
```

If there is no single `schema.sql`, run all migration files in order:

```bash
for f in sql/*.sql; do psql -U postgres -d ezeeflights -f "$f"; done
```

---

## 3. Configure environment variables

Copy the example file:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Then edit `apps/backend/.env`. **Required values to fill in:**

```env
# Database (required)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ezeeflights

# JWT (required — must be at least 32 characters)
JWT_SECRET=your-secret-at-least-32-chars-long
AUTH_ENCRYPTION_KEY=your-32-char-encryption-key-here

# Payment (at least one provider required for payment flows)
PAYMENT_PROVIDER=STRIPE
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Amadeus (required for real flight search; use placeholders to skip)
AMADEUS_CLIENT_ID=your-amadeus-client-id
AMADEUS_CLIENT_SECRET=your-amadeus-client-secret
AMADEUS_ENV=test
```

**Optional — leave empty to disable the feature:**

```env
GOOGLE_CLIENT_ID=          # Google OAuth login
OPENAI_API_KEY=            # AI itinerary / chat features
SENDGRID_API_KEY=          # Transactional email
REDIS_URL=                 # Falls back to in-memory cache if empty
```

---

## 4. Start the development server

```bash
cd apps/backend
npm run dev
```

The server starts with hot-reload (NestJS watch mode). You should see:

```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [NestApplication] Nest application successfully started
```

API is now available at **http://localhost:4000/v1**

---

## 5. Verify it's running

```bash
curl http://localhost:4000/v1/flights/search?origin=DXB&destination=LHR&date=2026-06-01&travelers=1
```

Expected: a JSON array (empty if Amadeus credentials are placeholders).

---

## 6. Run tests

```bash
cd apps/backend
npm test                  # all unit tests
npm run test:e2e          # end-to-end tests (requires database)
```

---

## Troubleshooting

### Port 4000 already in use

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <pid> /F

# macOS/Linux
lsof -ti:4000 | xargs kill -9
```

### "Nest can't resolve dependencies" on startup

A provider is missing from a module's `providers` array. Check the error message for the module name and the missing dependency, then add it to that module's `providers` (and `exports` if other modules use it).

### Database connection refused

Make sure PostgreSQL is running and `DATABASE_URL` uses the correct host, port, username, and password.

### Redis warning (non-fatal)

```
WARN [HybridCacheService] REDIS_URL is not configured. Falling back to in-memory cache.
```

This is safe to ignore in local development. The app continues to work — caching just isn't persistent across restarts.
