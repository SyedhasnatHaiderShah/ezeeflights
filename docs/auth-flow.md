# Authentication Flow

The API is implemented with **NestJS** (controller / service / repository).

## Passwords (bcrypt + lazy migration)

- **New** passwords (register, admin user create) are stored with **bcrypt** (12 rounds).
- **Legacy** rows still using **scrypt** (`salt:hash` hex format) verify on login; on success the service **re-hashes with bcrypt** and updates `users.password_hash` (transparent migration).

## JWT access + refresh (Nest API)

1. `POST /v1/auth/register` or `POST /v1/auth/login` returns `accessToken`, `refreshToken`, and may set Nest’s **HttpOnly** `refresh_token` cookie when the client hits the API directly.
2. Protected routes use `JwtAuthGuard` with `Authorization: Bearer <accessToken>`.
3. `POST /v1/auth/refresh-token` rotates refresh tokens in the database.
4. `POST /v1/auth/logout` / `logout-all` revoke refresh rows as before.

## Next.js BFF (cookie-only browser)

The **browser** should talk only to **same-origin** `/api/*` routes. Those route handlers:

1. Call the Nest API from the server using `INTERNAL_API_BASE_URL` (never expose this URL to the client in production builds if you can avoid it).
2. On successful login/register/refresh/OAuth exchange/2FA completion, set **first-party HttpOnly** cookies: `ezee_access`, `ezee_refresh` (and `ezee_2fa_pending` during the 2FA step).
3. Expose `GET /api/auth/csrf` which sets a **readable** `ezee_csrf` cookie and returns the token; the SPA sends `X-CSRF-Token` on **POST/PUT/PATCH/DELETE** to `/api/auth/*` and `/api/v1/*`.
4. Proxy data APIs through ` /api/v1/[...path] `, attaching `Authorization: Bearer` from `ezee_access` server-side.

**CSRF model:** SameSite=Lax on cookies + header must match `ezee_csrf` for mutating requests.

**Env:** `INTERNAL_API_BASE_URL` (e.g. `http://backend:4000` in Docker). `NEXT_PUBLIC_API_BASE_URL` remains used for the Google OAuth jump to the API host and for any legacy direct calls.

## Two-factor (TOTP)

1. Nest returns `requiresTwoFactor` + `pendingToken`; the BFF stores the pending value in **HttpOnly** `ezee_2fa_pending` and returns `{ requiresTwoFactor: true }` without tokens in JSON.
2. `POST /api/auth/2fa/verify-login` with `{ code }` — BFF forwards `pendingToken` from the cookie to Nest, then sets session cookies.

Requires `AUTH_ENCRYPTION_KEY` (64 hex chars) for TOTP secret storage.

## OAuth (Google)

1. Browser opens the Nest `GET /v1/auth/google` URL (see `GOOGLE_CALLBACK_URL`).
2. Callback redirects to `{FRONTEND_OAUTH_REDIRECT}/auth/callback?code=...`.
3. SPA calls **`POST /api/auth/oauth/exchange`** (BFF) with CSRF; BFF exchanges with Nest and sets cookies.

## RBAC

- JWT `roles` from `user_roles` (fallback: legacy `users.role`).
- Use `RolesGuard` / `PermissionsGuard` on Nest controllers.

## Security controls (Nest)

- `helmet`, `cookie-parser`, CORS + `FRONTEND_ORIGIN` for direct API clients.
- Throttler on the auth controller.
- Refresh token hashes (SHA-256) in `refresh_tokens`.
- Winston logging (`LOG_LEVEL`).

## Frontend

- `/login`, `/register`, `/2fa`, `/auth/callback` — no access tokens in `localStorage`/Zustand.
- Middleware checks HttpOnly session presence via **`ezee_access`** cookie name (opaque check only).
