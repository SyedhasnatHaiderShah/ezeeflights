import { FAQSection } from '@/components/sections/FAQSection';
import { PremiumCalculator } from '@/components/insurance/PremiumCalculator';
import { TrustStrip } from '@/components/sections/TrustStrip';
import { listInsurancePlans } from '@/lib/api/insurance-api';

export default async function InsurancePage() {
  let plans: Awaited<ReturnType<typeof listInsurancePlans>> = [];
  try {
    plans = await listInsurancePlans();
  } catch {
    plans = [];
  }

  const ordered = ['basic', 'standard', 'premium']
    .map((level) => plans.find((plan) => plan.coverageLevel === level))
    .filter(Boolean);

  return (
    <main className="space-y-10 pb-10">
      <section className="bg-gradient-to-br from-[#072f66] via-[#0b3f85] to-[#071f43] px-6 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Insurance</p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">Travel With Peace of Mind</h1>
            <p className="mt-4 max-w-xl text-white/85">Choose coverage built for every type of trip with transparent benefits, instant claims support, and flexible upgrades.</p>
          </div>
          <div className="rounded-2xl bg-white/95 p-2 text-black"><PremiumCalculator premium={null} /></div>
          <TrustStrip />
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {ordered.length > 0 ? ordered.map((plan) => (
            <article key={plan!.id} className={`relative rounded-2xl border p-5 shadow-sm ${plan!.coverageLevel === 'standard' ? 'border-brand-red ring-2 ring-brand-red/20' : 'border-slate-200'}`}>
              {plan!.coverageLevel === 'standard' && <span className="absolute -top-3 right-4 rounded-full bg-brand-red px-3 py-1 text-xs font-semibold text-white">Most Popular</span>}
              <h3 className="text-xl font-bold capitalize">{plan!.coverageLevel}</h3>
              <p className="mt-2 text-sm text-slate-600">{plan!.name}</p>
              <p className="mt-4 text-2xl font-black">{plan!.currency} {Number(plan!.pricePerDay ?? 0).toFixed(0)}<span className="text-sm font-medium text-slate-500">/day</span></p>
            </article>
          )) : <p className="text-sm text-gray-500">No plans available yet.</p>}
        </div>

        <div className="overflow-x-auto rounded-2xl border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3">Feature</th><th className="p-3">Basic</th><th className="p-3">Standard</th><th className="p-3">Premium</th>
              </tr>
            </thead>
            <tbody>
              {['Medical emergency', 'Trip cancellation', 'Baggage loss', 'Adventure sports'].map((f) => (
                <tr key={f} className="border-t"><td className="p-3 font-medium">{f}</td><td className="p-3">✓</td><td className="p-3">✓✓</td><td className="p-3">✓✓✓</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6"><FAQSection /></section>
    </main>
  );
}
