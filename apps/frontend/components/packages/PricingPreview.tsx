import { AiGeneratedPackage } from '@/lib/api/ai-itinerary-api';

export function PricingPreview({ pricing }: { pricing?: AiGeneratedPackage['generatedOutput']['pricing'] }) {
  if (!pricing) return null;

  return (
    <div className="rounded border bg-white p-4">
      <h3 className="mb-2 font-semibold">Estimated Pricing</h3>
      <p className="text-2xl font-bold">${pricing.estimated_total.toLocaleString()}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        {Object.entries(pricing.breakdown).map(([k, v]) => (
          <div key={k} className="rounded bg-slate-50 p-2">
            <span className="capitalize">{k}</span>
            <p className="font-medium">${Number(v).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
