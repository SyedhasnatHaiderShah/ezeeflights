# Frontend — Local Development Guide

Next.js app running on **http://localhost:3000**

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | Comes with Node |
| Backend | running on :4000 | See `backend.md` |

---

## 1. Install dependencies

From the **repo root**:

```bash
npm install
```

Or from the frontend directory:

```bash
cd apps/frontend
npm install
```

---

## 2. Configure environment variables

Copy the example file:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

Edit `apps/frontend/.env.local`:

```env
# Required — URL the browser uses to call the backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/v1

# Required — URL Next.js server components use (can be same as above)
INTERNAL_API_BASE_URL=http://localhost:4000/v1
```

**Optional — leave empty to disable the feature:**

```env
GEMINI_API_KEY=           # AI destination recommendations (Gemini)
NEXT_PUBLIC_MAP_PROVIDER= # Map display (mapbox, etc.)
```

---

## 3. Start the development server

Make sure the **backend is running first** (see `backend.md`), then:

```bash
cd apps/frontend
npm run dev
```

App is available at **http://localhost:3000**

---

## 4. Key pages

| URL | Description |
|-----|-------------|
| `/` | Home / search |
| `/flights/result?origin=DXB&destination=LHR&date=2026-06-01&travelers=1` | Flight search results |
| `/flights/confirmation?bookingId=<id>` | Booking confirmation |
| `/payment/checkout?bookingId=<id>` | Payment checkout |
| `/payment/success?payment_id=<id>` | Payment success |
| `/payment/failed` | Payment failed |
| `/my-trips` | User booking history |
| `/admin` | Admin panel |

---

## 5. Build for production

```bash
cd apps/frontend
npm run build
npm run start
```

---

## Troubleshooting

### Port 3000 already in use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Flight search shows no results

- Confirm the backend is running on port 4000
- Check `NEXT_PUBLIC_API_BASE_URL` and `INTERNAL_API_BASE_URL` in `.env.local`
- If using Amadeus placeholder credentials, the backend returns an empty array — this is expected

### "Failed to fetch" / CORS errors in browser console

- The backend `FRONTEND_ORIGIN` in `apps/backend/.env` must match where the frontend is running (default: `http://localhost:3000`)

### AI recommendations not showing

- Set `GEMINI_API_KEY` in `.env.local` with a valid Google AI Studio key

### Auth not working / login redirect fails

- For Google OAuth: set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `apps/backend/.env` and register `http://localhost:4000/v1/auth/google/callback` as an authorised redirect URI in Google Cloud Console
- For email/password auth: no extra config needed
