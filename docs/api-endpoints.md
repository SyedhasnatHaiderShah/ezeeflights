# API Endpoints (v1)

## Auth
- `POST /v1/auth/login`
- `GET /v1/auth/google`
- `GET /v1/auth/google/callback`

## Flights
- `GET /v1/flights/search?origin=DXB&destination=LHR&departureDate=2026-10-01&page=1&limit=20`
- `GET /v1/flights/:id`

## Booking / Payment / User
- `GET /v1/booking/health`
- `POST /v1/booking` (planned)
- `POST /v1/payment` (planned)
- `GET /v1/user/profile` (planned)
