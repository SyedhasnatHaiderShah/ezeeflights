# Observability Guide — ezeeFlight Backend

## Overview

The backend has two observability layers that are tied together by a single `correlationId` UUID:

| Layer | Tool | Purpose |
|---|---|---|
| Structured logging | Pino (JSON) | Full request/response trace, timing, external API calls |
| Error tracking | Sentry | Rich stack traces, user impact, release tracking |
| _(Future)_ Log shipping | Better Stack / Datadog | Searchable centralised log storage |

Every log line and every Sentry event carries the same `correlationId`, so a single ID is enough to reconstruct any request's full lifecycle.

---

## 1. Sentry Setup (First Time)

### Create a free account

1. Go to [sentry.io](https://sentry.io) and sign up (free tier: 5 000 errors/month).
2. Create an **Organisation** (e.g. `ezeeflights`).
3. Create a **Project**: choose **Node.js** as the platform.
4. Copy the **DSN** from _Project → Settings → Client Keys (DSN)_.

### Wire up environment variables

Add to your `.env` (never commit this file):

```env
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@oxxxxxxxxx.ingest.sentry.io/xxxxxxxx
SENTRY_ENVIRONMENT=development
SENTRY_ENABLE_DEV=true      # only needed for local testing of Sentry
```

In production / staging (CI/CD pipeline):

```env
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=v1.2.3        # or $(git rev-parse --short HEAD)
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

### Verify it works

```bash
# Start dev server with Sentry enabled
SENTRY_DSN=https://... SENTRY_ENABLE_DEV=true npm run dev

# In another terminal — trigger a test 500:
curl -X GET http://localhost:4000/v1/__sentry-test \
  -H "x-correlation-id: test-abc-123" \
  -H "Authorization: Bearer <any_token>"
# (or temporarily throw new Error('sentry test') from any service)
```

Go to _sentry.io → Issues_ — you should see the error within seconds. Click it and verify:
- `correlationId` tag is present and matches your `x-correlation-id` header
- Stack trace shows your TypeScript source (once source maps are uploaded)
- User context shows the `userId`

---

## 2. Source Map Upload (CI/CD)

Source maps let Sentry show TypeScript line numbers instead of compiled JS.

### Install the CLI

```bash
npm install --save-dev @sentry/cli
```

### Add a script to `package.json`

```json
"scripts": {
  "sentry:sourcemaps": "sentry-cli sourcemaps inject --org $SENTRY_ORG --project $SENTRY_PROJECT ./dist && sentry-cli sourcemaps upload --org $SENTRY_ORG --project $SENTRY_PROJECT ./dist"
}
```

### Enable source maps in `tsconfig.json`

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true,
    "sourceRoot": "/"
  }
}
```

### CI/CD pipeline (GitHub Actions example)

```yaml
- name: Build
  run: npm run build
  env:
    NODE_ENV: production

- name: Upload source maps to Sentry
  run: npm run sentry:sourcemaps
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ezeeflights
    SENTRY_PROJECT: ezeeflights-backend
    SENTRY_RELEASE: ${{ github.sha }}
```

Add `SENTRY_AUTH_TOKEN` to your GitHub repo secrets (_Settings → Secrets → Actions_).  
Generate a token at _sentry.io → Settings → Auth Tokens_ with `project:releases` and `org:read` scopes.

---

## 3. Log Shipping (Future)

When you're ready to add centralised log storage, edit [`src/common/logger/logger.config.ts`](../src/common/logger/logger.config.ts) and follow the commented-out instructions in `buildTransport()`.

### Better Stack (recommended first choice)

```bash
npm install @logtail/pino
```

```env
LOG_SHIPPING_PROVIDER=better-stack
LOGTAIL_SOURCE_TOKEN=<your-token>
```

Then in `buildTransport()`, uncomment and return the multi-target transport.

### Datadog

```bash
npm install pino-datadog-transport
```

```env
LOG_SHIPPING_PROVIDER=datadog
DATADOG_API_KEY=<your-key>
DATADOG_SITE=datadoghq.com
```

---

## 4. Debugging Playbook — Production Incident

### Step 1 — Get the correlation ID

Every API response returns `x-correlation-id` in the headers. If a user reports an error, ask them for the error response or check Sentry (the `correlationId` tag is on every event).

```bash
curl -I https://api.ezeeflights.com/v1/flights/search?origin=DXB&destination=LHR&...
# → x-correlation-id: 7f3a9b2c-1234-...
```

### Step 2 — Find the Sentry event

In Sentry, search:
```
tags.correlationId:"7f3a9b2c-1234-..."
```
This shows the exact exception, stack trace, release version, affected user, and breadcrumbs.

### Step 3 — Reconstruct the full log trace (local / shipped logs)

Filter your Pino JSON logs by correlation ID:

```bash
# Local (dev):
cat app.log | node -e "process.stdin.pipe(require('ndjson').parse()).on('data', d => { if(d.correlationId === '7f3a9b2c-1234-...') console.log(JSON.stringify(d)) })"

# Better Stack (when enabled):
# In the Better Stack console, use the query: correlationId = "7f3a9b2c-1234-..."

# Datadog (when enabled):
# Query: @correlationId:"7f3a9b2c-1234-..."
```

### Step 4 — Trace the external API call

The `AmadeusProvider`, `PaytabsProvider`, etc. all log `correlationId` on every SDK/HTTP call. Look for log entries with `msg: "Amadeus searchFlights: SDK error"` and `correlationId` matching your ID. The `durationMs` field tells you whether it was a timeout.

### Step 5 — Check user impact in Sentry

In Sentry → _Issues → [the issue] → Tags → userId_, you can see how many unique users hit this error and whether it's isolated to one account or widespread. Cross-reference with the `release` tag to confirm which deploy introduced it.

---

## 5. Sensitive Data Policy

The following fields are **always redacted** before they leave the server — in both Pino logs and Sentry events:

| Field | Where |
|---|---|
| `req.headers.authorization` | Pino redact + Sentry `beforeSend` |
| `req.headers.cookie` | Pino redact + Sentry `beforeSend` |
| `*.password` / `*.currentPassword` / `*.newPassword` | Pino redact + Sentry `beforeSend` |
| `*.token` / `*.refreshToken` | Pino redact + Sentry `beforeSend` |
| `*.cardNumber` / `*.cvv` / `*.cvc` / `*.creditCard` | Pino redact + Sentry `beforeSend` |
| `*.apiKey` / `*.api_key` / `*.secret` | Pino redact + Sentry `beforeSend` |

4xx client errors (validation failures, auth errors) are logged locally but **never sent to Sentry** — this prevents noise and keeps PII out of the error tracker.
