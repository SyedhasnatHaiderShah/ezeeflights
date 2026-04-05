# ezeeFlights

Enterprise-ready AI-powered Online Travel Agency platform.

## Monorepo layout
- `apps/backend`: NestJS API (modular monolith, microservices-ready boundaries)
- `apps/frontend`: Next.js web app
- `sql`: PostgreSQL schema and indexes
- `infra`: Docker + AWS deployment artifacts
- `.github/workflows`: CI/CD pipelines

## Quick start
```bash
cp .env.example .env

docker compose -f infra/docker/docker-compose.yml up --build
```

## Architecture highlights
- Clean architecture layering: controller -> service -> repository -> entity
- Feature modules: auth, flight, hotel, booking, user, payment, ai
- Redis caching/session abstraction
- JWT + OAuth-ready auth
- Swagger API docs + API versioning `/v1`
