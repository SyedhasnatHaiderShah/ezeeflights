export function ItineraryTimeline({ itinerary }: { itinerary: Array<{ id: string; dayNumber: number; title: string; description: string }> }) {
  return (
    <ol className="space-y-3">
      {itinerary.map((day) => (
        <li key={day.id} className="rounded-lg border-l-4 border-blue-500 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-blue-600">Day {day.dayNumber}</p>
          <h4 className="font-semibold">{day.title}</h4>
          <p className="text-sm text-slate-600">{day.description}</p>
        </li>
      ))}
    </ol>
  );
}
