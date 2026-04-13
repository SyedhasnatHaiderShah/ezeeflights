import { PremiumBreakdown } from '@/lib/api/insurance-api';

export function PremiumCalculator({ premium }: { premium: PremiumBreakdown | null }) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="font-semibold">Premium calculator</h3>
      {!premium ? <p className="mt-2 text-sm text-gray-500">Select dates and traveler details to calculate premium.</p> : (
        <ul className="mt-3 space-y-1 text-sm">
          <li>Trip days: {premium.tripDays}</li>
          <li>Travelers: {premium.travelers}</li>
          <li>Base premium: {premium.currency} {premium.basePremium.toFixed(2)}</li>
          <li>Adventure addon: {premium.currency} {premium.adventureSportsPremium.toFixed(2)}</li>
          <li className="pt-1 text-base font-semibold">Total: {premium.currency} {premium.totalPremium.toFixed(2)}</li>
        </ul>
      )}
    </div>
  );
}
