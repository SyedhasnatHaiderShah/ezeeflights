# AI Itinerary Module

## Endpoints
- `POST /v1/admin/ai/generate-package`
- `GET /v1/admin/ai/packages`
- `GET /v1/admin/ai/packages/:id`
- `POST /v1/admin/ai/packages/:id/approve`
- `POST /v1/admin/ai/packages/:id/reject`
- `POST /v1/admin/ai/packages/:id/convert`

## Generate request body
```json
{
  "destination": "Bali",
  "durationDays": 5,
  "budgetMin": 1000,
  "budgetMax": 3000,
  "travelerType": "couple",
  "preferences": ["cultural", "relaxation"],
  "userId": "optional-uuid"
}
```

## Strict AI response shape
```json
{
  "title": "",
  "description": "",
  "duration_days": 5,
  "itinerary": [{ "day": 1, "title": "", "activities": [], "hotel_suggestion": "" }],
  "pricing": { "estimated_total": 0, "breakdown": { "hotel": 0, "activities": 0, "transfers": 0, "margin": 0 } },
  "inclusions": [],
  "exclusions": []
}
```

## Convert request body
```json
{
  "status": "published",
  "itineraryOverrides": [{ "day": 2, "title": "Updated Day 2" }]
}
```
