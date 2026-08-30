import { AiGeneratedPackage } from '@/lib/api/ai-itinerary-api';

export function ItineraryPreview({ data }: { data?: AiGeneratedPackage['generatedOutput'] }) {
  if (!data) return <div className="rounded border p-4 text-sm text-slate-500">Generate a package to preview itinerary.</div>;

  return (
    <div className="rounded border bg-white p-4">
      <h3 className="text-lg font-semibold">{data.title}</h3>
      <p className="mb-4 text-sm text-slate-600">{data.description}</p>
      <div className="space-y-2">
        {data.itinerary.map((day) => (
          <div key={day.day} className="rounded border p-3">
            <p className="font-medium">Day {day.day}: {day.title}</p>
            <p className="text-sm">Hotel: {day.hotel_suggestion}</p>
            <ul className="list-inside list-disc text-sm text-slate-700">{day.activities.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}
