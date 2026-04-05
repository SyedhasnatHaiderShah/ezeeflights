# ezeeFlights Architecture (Phase 1 -> Phase 2)

## 1) Project setup
- Monorepo with `apps/frontend` and `apps/backend`.
- Dockerized local stack with PostgreSQL + Redis.
- CI pipeline for test/build/deploy gates.

## 2) Backend structure (NestJS)
- Layered architecture per module:
  - `controllers/` (transport)
  - `services/` (business logic)
  - `repositories/` (data access)
  - `entities/` (domain shape)
- Modules: `auth`, `flight`, `hotel`, `booking`, `user`, `payment`, `ai`.
- API versioning via `/v1` and Swagger docs at `/docs`.

## 3) Frontend structure (Next.js)
- App Router + TypeScript + Tailwind.
- Container/Presentational split:
  - `components/containers`: logic/data hooks.
  - `components/presentational`: pure UI renderers.
- Data strategy:
  - SSR/Server Components for dynamic secured detail pages.
  - SSG with revalidation for destinations catalog.
  - Client fetch with React Query for dashboard and search interactions.
- State strategy:
  - Local state for local forms.
  - Zustand for cross-page search context.
  - React Query for server cache.

## 4) Flight module (first complete feature)
- Endpoint: `GET /v1/flights/search`
- Endpoint: `GET /v1/flights/:id` (JWT-protected)
- Supports pagination, indexes, filters (route/date/cabin/currency).

## Microservices-ready migration path
- Keep contracts and domain events isolated per module.
- Replace repositories with service clients module-by-module.
- Move AI and payment to separate deployable services first.
