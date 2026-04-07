# Billing Module (Invoice & VAT)

## Database Schema (PostgreSQL)

Migration: `sql/migrations/007_billing_module.sql`

### `invoices`
- `id UUID PK`
- `booking_id UUID` -> `bookings(id)`
- `user_id UUID` -> `users(id)`
- `invoice_number UNIQUE`
- `total_amount NUMERIC(12,2)`
- `vat_amount NUMERIC(12,2)`
- `currency VARCHAR(3)`
- `status ENUM-like CHECK ('ISSUED' | 'PAID' | 'CANCELLED')`
- `created_at TIMESTAMPTZ`

### `invoice_items`
- `id UUID PK`
- `invoice_id UUID` -> `invoices(id)`
- `description TEXT`
- `quantity INT`
- `unit_price NUMERIC(12,2)`
- `total_price NUMERIC(12,2)`

### `payments` (extended existing table)
- added `invoice_id UUID NULL` -> `invoices(id)`
- added `method CHECK ('CARD' | 'BNPL')`

### `credit_notes`
- `id UUID PK`
- `invoice_id UUID` -> `invoices(id)`
- `amount NUMERIC(12,2)`
- `reason TEXT`
- `created_at TIMESTAMPTZ`

## VAT Rules
- UAE VAT configurable via `UAE_VAT_PERCENT`, default `5`.
- VAT extraction assumes booking total is VAT-inclusive:
  - `vat = total * rate / (100 + rate)`

## API

### Versioned
- `POST /v1/invoices/generate`
- `GET /v1/invoices/:id`
- `GET /v1/invoices/user/:userId`
- `POST /v1/invoices/:id/pay`
- `POST /v1/invoices/:id/refund`

### Legacy-compatible
- `POST /api/invoices/generate`
- `GET /api/invoices/:id`
- `GET /api/invoices/user/:userId`
- `POST /api/invoices/:id/pay`
- `POST /api/invoices/:id/refund`

## Module Integration
- Booking module: listens to `booking.confirmed` and auto-generates invoice.
- Payment module: payment records are persisted in existing `payments` table, linked by `invoice_id`.
- Notification module: sends invoice-generated email with PDF path in payload.

## PDF Storage
- path controlled by `BILLING_PDF_STORAGE_PATH` (default `./tmp/invoices`).
