# Travelport Proxy & Local Setup Instructions

I have created the secure proxy endpoint on the RDP, which fetches live Travelport data and exposes it securely so you can bypass the Indian region block from your local machine in Pakistan.

## 1. Firewall Security Setup

To prevent attackers from abusing this endpoint or flooding Travelport, I have added an application-level firewall on the `POST /v1/flights/travelport-proxy/search` and `POST /v1/hotels/travelport-proxy/search` endpoints.

The proxy will **reject** any request unless the `X-API-KEY` header exactly matches the `EZEEFLIGHTS_API_KEY` defined in the RDP's `.env`. Since your local codebase is already designed to attach the `EZEEFLIGHTS_API_KEY` to the headers, this protection is entirely seamless for you!

## 2. Local Environment Configuration

On your **local machine in Pakistan**, open your `apps/backend/.env` file. You want to add the new `EZEEFLIGHTS_SEARCH_URL` pointing to the RDP proxy, while keeping the original URL commented out as a fallback for emergencies.

**Replace Lines 10-11 in your local `.env` with the following block:**

```env
# --- EZEEFLIGHTS EXTERNAL API SETTINGS ---

# [ORIGINAL / EMERGENCY FALLBACK]
# Uncomment this and comment the one below to route directly to the official EzeeFlights API
# EZEEFLIGHTS_SEARCH_URL=https://api.ezeeflights.com/api/Flights/Search

# [RDP PROXY API]
# This points your local machine to the Travelport Proxy running on the Indian RDP
EZEEFLIGHTS_SEARCH_URL=http://103.151.198.197:4000/v1/flights/travelport-proxy/search
EZEEFLIGHTS_HOTEL_SEARCH_URL=http://103.151.198.197:4000/v1/hotels/travelport-proxy/search
EZEEFLIGHTS_CAR_SEARCH_URL=http://103.151.198.197:4000/v1/cars/travelport-proxy/search

# Ensure your local API key matches the RDP API key exactly. This acts as the Firewall password.
EZEEFLIGHTS_API_KEY=4xCY3t0d_mg

# Dev only: Bypass invalid/expired TLS certs (useful if local requests fail with SSL errors)
EZEEFLIGHTS_TLS_SKIP_VERIFY=true

# This flag tells the local server to bypass direct Travelport SOAP requests and use the proxy URLs above instead
TRAVELPORT_API=false
```

_(If your local frontend expects the backend to run on port 3000 instead of 4000, adjust the port as necessary, though the proxy on the RDP is running on the backend)._

## 3. How to verify it works in code

1. Ensure `TRAVELPORT_API=false` in your local `.env`. This forces both Flights and Hotels (and eventually Cars) to route via the proxy.
2. Ensure `npm run dev` is running on the RDP.
3. Make a flight or hotel search on your local machine. The request will automatically be securely authenticated via the `EZEEFLIGHTS_API_KEY` and fulfilled by the RDP!

---

## 4. How to Test via Postman / cURL (Payload Examples)

If you want to test the RDP proxy APIs directly from Postman or your terminal (to see the raw discounted/un-discounted JSON data), you can use the exact payload formats the endpoints expect.

### A. Flight Search Proxy

**Endpoint:** `POST http://103.151.198.197:4000/v1/flights/travelport-proxy/search`

**Headers Required:**
- `Content-Type: application/json`
- `x-api-key: 4xCY3t0d_mg`

**JSON Body (Payload):**

```json
{
  "searchId": "",
  "tranId": "",
  "from": "LHE",
  "to": "DXB",
  "depDate": "2026-07-15T00:00:00Z",
  "retDate": "0001-01-01T00:00:00Z",
  "adult": 1,
  "child": 0,
  "infant": 0,
  "flightWay": 1,
  "flightClass": 0,
  "airline": null,
  "isDirect": false,
  "isFlexi": false,
  "currency": null,
  "siteCode": null,
  "sourceMedia": null,
  "isDeepLink": false,
  "apiKey": null,
  "preferedAirlines": [],
  "includePreferedAirlines": false
}
```

**cURL Example (Flights):**

```bash
curl -X POST http://103.151.198.197:4000/v1/flights/travelport-proxy/search \
  -H "Content-Type: application/json" \
  -H "x-api-key: 4xCY3t0d_mg" \
  -d '{"from":"LHE","to":"DXB","depDate":"2026-07-15T00:00:00Z","retDate":"0001-01-01T00:00:00Z","adult":1,"child":0,"infant":0,"flightWay":1}'
```

### B. Hotel Search Proxy

**Endpoint:** `POST http://103.151.198.197:4000/v1/hotels/travelport-proxy/search`

**Headers Required:**
- `Content-Type: application/json`
- `x-api-key: 4xCY3t0d_mg`

**JSON Body (Payload):**

```json
{
  "city": "Dubai",
  "checkInDate": "2026-07-15",
  "checkOutDate": "2026-07-20",
  "adults": 2,
  "rooms": 1
}
```

**cURL Example (Hotels):**

```bash
curl -X POST http://103.151.198.197:4000/v1/hotels/travelport-proxy/search \
  -H "Content-Type: application/json" \
  -H "x-api-key: 4xCY3t0d_mg" \
  -d '{"city":"Dubai","checkInDate":"2026-07-15","checkOutDate":"2026-07-20","adults":2,"rooms":1}'
```

### C. Car Search Proxy

**Endpoint:** `POST http://103.151.198.197:4000/v1/cars/travelport-proxy/search`

**Headers Required:**
- `Content-Type: application/json`
- `x-api-key: 4xCY3t0d_mg`

**JSON Body (Payload):**

```json
{
  "pickupLocationId": "DXB",
  "dropoffLocationId": "DXB",
  "pickupDate": "2026-07-15T10:00:00Z",
  "dropoffDate": "2026-07-20T10:00:00Z"
}
```

**cURL Example (Cars):**

```bash
curl -X POST http://103.151.198.197:4000/v1/cars/travelport-proxy/search \
  -H "Content-Type: application/json" \
  -H "x-api-key: 4xCY3t0d_mg" \
  -d '{"pickupLocationId":"DXB","dropoffLocationId":"DXB","pickupDate":"2026-07-15T10:00:00Z","dropoffDate":"2026-07-20T10:00:00Z"}'
```
