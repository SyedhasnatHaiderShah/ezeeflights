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
- `POST /v1/payment` (JWT, legacy-compatible)
- `POST /v1/payments/initiate` (JWT)
- `POST /v1/payments/refund` (JWT)
- `GET /v1/payments/:id` (JWT)
- `POST /v1/payments/webhook/stripe`
- `POST /v1/payments/webhook/paytabs`
- `POST /v1/payments/webhook/tabby`
- `POST /v1/payments/webhook/tamara`
- `GET /v1/payments/admin/transactions` (JWT Admin)

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

## Billing
- `POST /v1/invoices/generate` (JWT)
- `GET /v1/invoices/:id` (JWT)
- `GET /v1/invoices/user/:userId` (JWT)
- `POST /v1/invoices/:id/pay` (JWT)
- `POST /v1/invoices/:id/refund` (JWT)
- `POST /api/invoices/generate` (JWT, legacy-compatible)
- `GET /api/invoices/:id` (JWT, legacy-compatible)
- `GET /api/invoices/user/:userId` (JWT, legacy-compatible)
- `POST /api/invoices/:id/pay` (JWT, legacy-compatible)
- `POST /api/invoices/:id/refund` (JWT, legacy-compatible)

## Analytics Module (Admin)
- GET /api/analytics/revenue
- GET /api/analytics/bookings
- GET /api/analytics/funnel
- GET /api/analytics/user-behavior
