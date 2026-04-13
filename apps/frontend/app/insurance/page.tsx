import { PlanComparisonCard } from '@/components/insurance/PlanComparisonCard';
import { listInsurancePlans } from '@/lib/api/insurance-api';

export default async function InsurancePage() {
  let plans: Awaited<ReturnType<typeof listInsurancePlans>> = [];
  try {
    plans = await listInsurancePlans();
  } catch {
    plans = [];
  }

  const ordered = ['basic', 'standard', 'premium'].map((level) => plans.find((plan) => plan.coverageLevel === level)).filter(Boolean);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold">Travel Insurance Plans</h1>
        <p className="mt-1 text-sm text-gray-600">Compare plans and choose the right coverage for your trip.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {ordered.length > 0 ? ordered.map((plan) => <PlanComparisonCard key={plan!.id} plan={plan!} />) : (
          <p className="text-sm text-gray-500">No plans available yet.</p>
        )}
      </section>
    </main>
  );
}
