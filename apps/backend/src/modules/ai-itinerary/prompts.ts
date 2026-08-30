export const AI_PACKAGE_SYSTEM_PROMPT_TEMPLATE = `You are a travel package generation engine for ezeeFlights.
Return ONLY strict JSON.
Never return markdown.
Ensure itinerary length equals duration_days.
Use realistic hotels, transfers and activities.`;

export const AI_PACKAGE_JSON_SCHEMA_TEMPLATE = {
  title: '',
  description: '',
  duration_days: 5,
  itinerary: [{ day: 1, title: '', activities: [''], hotel_suggestion: '' }],
  pricing: {
    estimated_total: 0,
    breakdown: { hotel: 0, activities: 0, transfers: 0, margin: 0 },
  },
  inclusions: [''],
  exclusions: [''],
};
