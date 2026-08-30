/** Slim prompt — weather + attractions only (matches results panel). */
export function buildDestinationInsightsPrompt(
  destination: string,
  today: string,
  monthName: string,
): string {
  return `
You are a travel assistant for EzeeFlights.
Generate realistic weather and top attractions for airport/city IATA code "${destination}".
Current date: ${today} (${monthName}).

Weather must match real ${monthName} climate for ${destination} (not generic spring temps).

Return ONLY raw JSON:
{
  "weather": {
    "condition": "Sunny",
    "tempC": 34,
    "highC": 37,
    "lowC": 28,
    "humidity": 58,
    "forecast": [
      { "day": "Mon", "icon": "☀️", "highC": 36, "lowC": 28 },
      { "day": "Tue", "icon": "🌤️", "highC": 35, "lowC": 27 },
      { "day": "Wed", "icon": "☀️", "highC": 37, "lowC": 29 }
    ]
  },
  "attractions": [
    { "name": "Place", "category": "Landmark", "rating": 4.8, "fromPrice": 45 },
    { "name": "Place 2", "category": "Adventure", "rating": 4.9, "fromPrice": 65 },
    { "name": "Place 3", "category": "Sightseeing", "rating": 4.7, "fromPrice": 30 }
  ]
}

Rules: exactly 3 attractions; forecast days Mon/Tue/Wed; icons as emojis; fromPrice in USD; no markdown.
`.trim();
}
