'use client';

import { AiGeneratedPackage } from '@/lib/api/ai-itinerary-api';

export type ItineraryOverride = { day: number; title?: string; activities?: string[]; hotelSuggestion?: string };

export function EditableItineraryBuilder({ data, onChange }: { data?: AiGeneratedPackage['generatedOutput']; onChange: (rows: ItineraryOverride[]) => void }) {
  if (!data) return null;

  return (
    <div className="rounded border bg-white p-4">
      <h3 className="mb-2 font-semibold">Edit before publish</h3>
      <div className="space-y-2">
        {data.itinerary.map((row) => (
          <div key={row.day} className="grid grid-cols-1 gap-2 rounded border p-2 md:grid-cols-2">
            <input
              className="rounded border p-2"
              defaultValue={row.title}
              onChange={(e) => onChange([{ day: row.day, title: e.target.value }])}
            />
            <input
              className="rounded border p-2"
              defaultValue={row.hotel_suggestion}
              onChange={(e) => onChange([{ day: row.day, hotelSuggestion: e.target.value }])}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
