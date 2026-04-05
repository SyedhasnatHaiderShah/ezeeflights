# Authentication Flow

## JWT flow
1. Client submits credentials to `POST /v1/auth/login`.
2. Auth service validates user and issues JWT.
3. Client stores JWT in secure HTTP-only cookie (recommended for production).
4. Protected endpoints use `JwtAuthGuard` for bearer token validation.

## OAuth flow (Google)
1. Client opens `GET /v1/auth/google`.
2. Passport redirects to Google consent.
3. Google returns callback to `GET /v1/auth/google/callback`.
4. Backend maps provider profile to local user and issues JWT.

## Security controls
- Input validation via `class-validator`.
- Rate limiting via Nest Throttler.
- Environment-variable secrets with no hardcoded credentials.
