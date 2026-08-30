'use client';

export function DynamicItineraryView({ itinerary }: { itinerary: Array<any> }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Dynamic itinerary</h3>
      <ol className="space-y-2">
        {itinerary.map((day) => (
          <li key={day.day} className="rounded border p-3">
            <p className="font-medium">
              Day {day.day}: {day.title}
            </p>
            <p className="text-sm text-slate-600">{(day.activities ?? []).join(', ')}</p>
            <p className="text-sm text-slate-500">Hotel: {day.hotel ?? day.hotel_need ?? 'TBD'}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
