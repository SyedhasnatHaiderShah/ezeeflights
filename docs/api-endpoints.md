# API Endpoints (v1)

## Auth
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/auth/google`
- `GET /v1/auth/google/callback`

## Flights
- `GET /v1/flights/search?origin=DXB&destination=LHR&departureDate=2026-10-01&page=1&limit=20`
- `GET /v1/flights/:id` (JWT)

## Hotels
- `GET /v1/hotel/search?city=Dubai&page=1&limit=20`

## Booking
- `POST /v1/bookings` (JWT)
- `GET /v1/bookings/:id` (JWT)
- `GET /v1/bookings/user/:userId` (JWT)
- `PATCH /v1/bookings/:id/cancel` (JWT)

## Payment
- `POST /v1/payment` (JWT)

## User
- `GET /v1/user/profile` (JWT)

## AI
- `POST /v1/ai/assistant`
- `GET /v1/ai/search?prompt=...`
- `GET /v1/ai/price-prediction?route=DXB-LHR`

## Notifications API (v1)

- `POST /v1/notifications/send` - enqueue a notification for async delivery.
- `GET /v1/notifications/:id` - get notification status.
- `GET /v1/notifications/logs` - admin notification audit logs.
- `POST /v1/notifications/templates` - admin create/update template.
- `GET /v1/notifications/templates` - admin list templates.
