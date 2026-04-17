import { Injectable, Logger } from '@nestjs/common';
import { FlightService } from '../flight/services/flight.service';
import { HotelService } from '../hotel/services/hotel.service';
import { PostgresClient } from '../../database/postgres.client';

export interface AgentAction {
  type: string;
  payload: Record<string, unknown>;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

@Injectable()
export class ConversationalAgentService {
  private readonly logger = new Logger(ConversationalAgentService.name);

  constructor(
    private readonly db: PostgresClient,
    private readonly flightService: FlightService,
    private readonly hotelService: HotelService,
  ) {}

  async chat(
    sessionId: string,
    userMessage: string,
    userId?: string,
    context?: Record<string, unknown>,
  ): Promise<{ reply: string; actions?: AgentAction[] }> {
    const conversation = await this.getOrCreateConversation(sessionId, userId, context ?? {});
    const messages = ((conversation.messages as ConversationMessage[]) ?? []).slice(-10);
    const userProfile = await this.getUserProfile(userId);

    const systemPrompt = `You are ezeeFlight's AI travel agent. You help users plan and book travel.
You have access to flight search, hotel search, and itinerary generation tools.
Always be concise, helpful, and specific. When recommending flights or hotels,
include prices, dates, and a booking link. The user's profile: ${JSON.stringify(userProfile)}.
Current context: ${JSON.stringify(context ?? {})}.
Respond in the user's language.`;

    const response = await this.callModelWithTools(systemPrompt, messages, userMessage);

    const nextMessages: ConversationMessage[] = [
      ...messages,
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
      { role: 'assistant', content: response.reply, timestamp: new Date().toISOString() },
    ];

    await this.db.query(
      `UPDATE ai_conversations
       SET messages = $1::jsonb,
           context = $2::jsonb,
           updated_at = NOW()
       WHERE session_id = $3`,
      [JSON.stringify(nextMessages.slice(-10)), JSON.stringify(context ?? {}), sessionId],
    );

    return response;
  }

  async getConversationHistory(sessionId: string): Promise<ConversationMessage[]> {
    const row = await this.db.queryOne<{ messages: ConversationMessage[] }>(
      'SELECT messages FROM ai_conversations WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1',
      [sessionId],
    );

    return row?.messages ?? [];
  }

  private async getOrCreateConversation(sessionId: string, userId?: string, context?: Record<string, unknown>) {
    const existing = await this.db.queryOne<{ id: string; messages: ConversationMessage[] }>(
      'SELECT id, messages FROM ai_conversations WHERE session_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
      [sessionId],
    );

    if (existing) {
      return existing;
    }

    const created = await this.db.queryOne<{ id: string; messages: ConversationMessage[] }>(
      `INSERT INTO ai_conversations (user_id, session_id, messages, context)
       VALUES ($1, $2, '[]'::jsonb, $3::jsonb)
       RETURNING id, messages`,
      [userId ?? null, sessionId, JSON.stringify(context ?? {})],
    );

    if (!created) {
      throw new Error('Unable to create conversation');
    }

    return created;
  }

  private async getUserProfile(userId?: string): Promise<Record<string, unknown>> {
    if (!userId) {
      return { segment: 'anonymous' };
    }

    const profile = await this.db.queryOne<{ id: string; email: string; preferredCurrency: string }>(
      `SELECT id, email, preferred_currency as "preferredCurrency"
       FROM users
       WHERE id = $1`,
      [userId],
    );

    return profile ?? { segment: 'unknown' };
  }

  private async callModelWithTools(
    systemPrompt: string,
    history: ConversationMessage[],
    userMessage: string,
  ): Promise<{ reply: string; actions?: AgentAction[] }> {
    const tools = [
      { name: 'search_flights' },
      { name: 'search_hotels' },
      { name: 'generate_itinerary' },
      { name: 'get_destination_info' },
      { name: 'get_visa_requirements' },
    ];

    const likelyFlight = /flight|fly|ticket/i.test(userMessage);
    const likelyHotel = /hotel|stay|resort/i.test(userMessage);
    const actions: AgentAction[] = [];

    if (likelyFlight) {
      const flights = await this.flightService.searchFlights({
        origin: 'DXB',
        destination: 'LHR',
        departureDate: new Date().toISOString().slice(0, 10),
        page: 1,
        limit: 3,
      });
      actions.push({ type: tools[0].name, payload: { results: flights } });
    }

    if (likelyHotel) {
      const hotels = await this.hotelService.search({ city: 'London', page: 1, limit: 3 });
      actions.push({ type: tools[1].name, payload: { results: hotels } });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        reply: 'I can help with flights, hotels, itineraries, and visa tips. Tell me dates, destination, and budget.',
        actions,
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
          temperature: 0.4,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.map((message) => ({ role: message.role, content: message.content })),
            { role: 'user', content: userMessage },
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'search_flights',
                description: 'Search flights by route and date',
                parameters: {
                  type: 'object',
                  properties: {
                    origin: { type: 'string' },
                    destination: { type: 'string' },
                    date: { type: 'string' },
                  },
                  required: ['origin', 'destination', 'date'],
                },
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        return { reply: 'I had trouble reaching the AI service. Please try again in a moment.', actions };
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return {
        reply: data.choices?.[0]?.message?.content ?? 'How would you like to continue your trip planning?',
        actions,
      };
    } catch (error) {
      this.logger.warn(`AI chat fallback used: ${(error as Error).message}`);
      return { reply: 'I can still help. Share your route, dates, and budget and I will suggest options.', actions };
    }
  }
}
