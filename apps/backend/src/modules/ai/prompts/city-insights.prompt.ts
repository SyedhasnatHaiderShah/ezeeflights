export function buildCityInsightsPrompt(cityName: string, today: string): string {
  return `
Provide travel insights and recommendations for the destination city: ${cityName}.
Current date: ${today}.

Respond strictly in RAW JSON format matching exactly this schema:
{
  "name": "${cityName}",
  "country": "Country Name",
  "description": "Short description of the city",
  "categories": ["Shopping", "Culture", "Luxury", "Nature"],
  "visa": {
    "type": "Visa type",
    "description": "Short visa info",
    "validity": "Validity period"
  },
  "health": {
    "vaccinations": ["Routine Vaccines"],
    "advisories": "Safety advice",
    "alert": "Safety/health warnings or heat warning"
  },
  "practical": {
    "currency": "Currency details",
    "exchangeRate": "Exchange rate details",
    "language": "Languages spoken",
    "religion": "Main religion",
    "connectivity": "Connectivity options",
    "simCost": "Estimated SIM cost",
    "tips": ["Local norm or safety tip", "SIM card or transit savings hack"],
    "emergency": {
      "police": "999",
      "medical": "998",
      "embassy": "Contact detail"
    }
  },
  "costs": {
    "meals": "Meals cost range",
    "accommodation": "Stays cost range",
    "transport": "Transit cost range",
    "flightCost": "Estimated flight cost starting range (e.g., $299)",
    "dailyTotal": "Estimated total",
    "tipping": "Tipping norm"
  },
  "climate": [
    { "month": "Jan", "temp": 19, "rainfall": 10, "crowd": "High" },
    { "month": "Mar", "temp": 23, "rainfall": 15, "crowd": "High" },
    { "month": "May", "temp": 31, "rainfall": 0, "crowd": "Medium" },
    { "month": "Jul", "temp": 36, "rainfall": 0, "crowd": "Low" },
    { "month": "Sep", "temp": 33, "rainfall": 0, "crowd": "Low" },
    { "month": "Nov", "temp": 25, "rainfall": 5, "crowd": "High" }
  ],
  "weather": [
    { "day": "MON", "temp": "22°C", "condition": "Clear Sky", "icon": "sunny" },
    { "day": "TUE", "temp": "23°C", "condition": "Partly Cloudy", "icon": "cloudy" },
    { "day": "WED", "temp": "24°C", "condition": "Rainy", "icon": "rainy" },
    { "day": "THU", "temp": "21°C", "condition": "Clear Sky", "icon": "sunny" },
    { "day": "FRI", "temp": "22°C", "condition": "Clear Sky", "icon": "sunny" }
  ],
  "hotels": [
    { "name": "Stay Name", "description": "Premium luxury stay details", "rating": "4.9" },
    { "name": "Resort Name", "description": "High-end resort details", "rating": "4.8" },
    { "name": "Boutique Hotel", "description": "Central boutique hotel details", "rating": "4.7" }
  ],
  "restaurants": [
    { "name": "Culinary Spot", "description": "Top-rated local cuisine details", "rating": "4.8" },
    { "name": "Fine Dining", "description": "Upscale dining spot details", "rating": "4.7" },
    { "name": "Bistro Lounge", "description": "Scenic local dining experience details", "rating": "4.8" }
  ],
  "attractions": [
    { "name": "Top Attraction", "description": "Famous landmark to visit", "rating": 4.9 },
    { "name": "Cultural Hub", "description": "Interactive museum or heritage district", "rating": 4.8 },
    { "name": "Panoramic View", "description": "Ideal sunset viewpoint or observation deck", "rating": 4.7 }
  ]
}

IMPORTANT:
- Provide exactly 5 days of weather starting from today (${today}).
- Use "sunny", "cloudy", "rainy", "showers", "storm", or "snow" for weather icon.
- Provide exactly 3 premium stays, 3 top-rated dining spots, and 3 famous attractions.
- The entire response must parse with JSON.parse() successfully.
- DO NOT wrap in markdown backticks.
`.trim();
}
