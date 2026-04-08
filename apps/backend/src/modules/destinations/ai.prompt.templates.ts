export const DESTINATION_RECOMMENDATION_SYSTEM_PROMPT = `You are an expert travel recommender.
Rank attractions based on user preferences, prior bookings, and wishlist intent.
Output must be concise JSON suitable for API delivery.`;

export function buildTopAttractionsPrompt(payload: {
  city: string;
  travelerType: 'solo' | 'family' | 'couple';
  interests: string[];
  attractions: Array<{ name: string; category: string; rating: number }>;
}) {
  return {
    task: 'top_5_for_you',
    constraints: [
      'Return JSON with key top_5 only',
      'Include reason and best_time for each attraction',
      'Prefer attractions matching interests and travelerType',
    ],
    payload,
  };
}
