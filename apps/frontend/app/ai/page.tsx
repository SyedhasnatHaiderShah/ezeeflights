'use client';

import { FormEvent, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { ChatBubble } from '@/components/ai/ChatBubble';
import { QuickReplies } from '@/components/ai/QuickReplies';
import { InlineFlightCard } from '@/components/ai/InlineFlightCard';
import { InlineHotelCard } from '@/components/ai/InlineHotelCard';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
interface AgentAction {
  type: string;
  payload: Record<string, unknown>;
}

interface ChatResponse {
  reply: string;
  actions?: AgentAction[];
  sessionId: string;
}

const quickReplies = ['Search flights to Bali', 'Plan a 7-day trip', 'Best time to visit Tokyo'];

export default function AiAssistantPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `web-${Date.now()}`);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setMessage('');

    try {
      const result = await apiFetch<ChatResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ sessionId, message: trimmed, context: { surface: 'ai-page' } }),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
      setActions(result.actions ?? []);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await send(message);
  };

  const renderedCards = useMemo(
    () =>
      actions.flatMap((action) => {
        const results = (action.payload.results as Array<Record<string, unknown>> | undefined) ?? [];
        if (action.type === 'search_flights') {
          return results.map((item, idx) => (
            <InlineFlightCard
              key={`f-${idx}`}
              id={String(item.id ?? idx)}
              airlineCode={String(item.airlineCode ?? item.airline_code ?? 'FL')}
              flightNumber={String(item.flightNumber ?? item.flight_number ?? '')}
              departureAirport={String(item.departureAirport ?? item.departure_airport ?? '')}
              arrivalAirport={String(item.arrivalAirport ?? item.arrival_airport ?? '')}
              departureAt={String(item.departureAt ?? item.departure_at ?? new Date().toISOString())}
              baseFare={Number(item.baseFare ?? item.base_fare ?? 0)}
              currency={String(item.currency ?? 'USD')}
            />
          ));
        }

        if (action.type === 'search_hotels') {
          return results.map((item, idx) => (
            <InlineHotelCard
              key={`h-${idx}`}
              id={String(item.id ?? idx)}
              name={String(item.name ?? 'Hotel')}
              city={String(item.city ?? '')}
              starRating={Number(item.starRating ?? item.star_rating ?? 3)}
              nightlyRate={Number(item.nightlyRate ?? item.nightly_rate ?? 0)}
              currency={String(item.currency ?? 'USD')}
            />
          ));
        }

        return [];
      }),
    [actions],
  );

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Ask AI for Trip</h1>
      <QuickReplies options={quickReplies} onPick={(value) => void send(value)} />

      <div className="space-y-3 rounded-xl border bg-slate-100 p-4">
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} role={msg.role}>
            {msg.content}
          </ChatBubble>
        ))}

        {loading && (
          <ChatBubble role="assistant">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:240ms]" />
            </span>
          </ChatBubble>
        )}

        {renderedCards}
      </div>

      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          className="flex-1 rounded border p-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me where and when you want to travel"
        />
        <button className="rounded bg-indigo-600 px-4 py-2 text-white" type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </section>
  );
}
