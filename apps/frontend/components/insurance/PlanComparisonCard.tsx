import Link from 'next/link';
import { InsurancePlan } from '@/lib/api/insurance-api';

const FEATURES: Array<{ key: string; label: string }> = [
  { key: 'medical_emergency', label: 'Medical emergency' },
  { key: 'trip_cancellation', label: 'Trip cancellation' },
  { key: 'baggage_loss', label: 'Baggage loss' },
  { key: 'covid_coverage', label: 'COVID coverage' },
  { key: 'adventure_sports', label: 'Adventure sports' },
];

export function PlanComparisonCard({ plan }: { plan: InsurancePlan }) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="text-xl font-semibold capitalize">{plan.coverageLevel}</h3>
      <p className="mt-1 text-sm text-gray-600">{plan.name}</p>
      <p className="mt-3 text-2xl font-bold">
        {plan.pricePerDay ? `${plan.currency} ${plan.pricePerDay}/day` : `${plan.currency} ${plan.priceAnnual}/year`}
      </p>

      <ul className="mt-4 space-y-2 text-sm">
        {FEATURES.map((feature) => {
          const value = plan.coverageDetails?.[feature.key];
          const enabled = typeof value === 'boolean' ? value : Boolean(value);
          return (
            <li key={feature.key} className="flex items-center justify-between border-b py-1">
              <span>{feature.label}</span>
              <span className={enabled ? 'text-green-600' : 'text-gray-400'}>{enabled ? '✓' : '—'}</span>
            </li>
          );
        })}
      </ul>

      <Link href={`/insurance/${plan.id}/purchase`} className="mt-5 inline-block w-full rounded bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white">
        Select {plan.coverageLevel}
      </Link>
    </article>
  );
}
