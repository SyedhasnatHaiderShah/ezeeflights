'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PremiumCalculator } from '@/components/insurance/PremiumCalculator';
import { Traveler, TravelerDetailsForm } from '@/components/insurance/TravelerDetailsForm';
import { calculateInsurancePremium, PremiumBreakdown, purchaseInsurancePolicy } from '@/lib/api/insurance-api';

export default function InsurancePurchasePage({ params }: { params: { planId: string } }) {
  const router = useRouter();
  const [travelers, setTravelers] = useState<Traveler[]>([{ name: '', dob: '', passport: '' }]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adventureSports, setAdventureSports] = useState(false);
  const [premium, setPremium] = useState<PremiumBreakdown | null>(null);
  const [message, setMessage] = useState('');

  const payloadReady = useMemo(() => {
    return startDate && endDate && travelers.every((item) => item.name && item.dob && item.passport);
  }, [startDate, endDate, travelers]);

  useEffect(() => {
    if (!payloadReady) return;
    calculateInsurancePremium({ planId: params.planId, startDate, endDate, travelers, adventureSports })
      .then(setPremium)
      .catch(() => setPremium(null));
  }, [params.planId, startDate, endDate, travelers, adventureSports, payloadReady]);

  const onPurchase = async () => {
    try {
      const created = await purchaseInsurancePolicy({ planId: params.planId, startDate, endDate, travelers, adventureSports });
      setMessage(`Policy purchased: ${(created as any).policyNumber}`);
      router.push('/insurance/policies');
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Purchase Travel Insurance</h1>

      <TravelerDetailsForm travelers={travelers} onChange={setTravelers} />

      <div className="grid gap-3 rounded-xl border p-4 md:grid-cols-2">
        <label className="text-sm">
          Start date
          <input className="mt-1 w-full rounded border px-2 py-1" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="text-sm">
          End date
          <input className="mt-1 w-full rounded border px-2 py-1" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      <label className="flex items-center gap-2 rounded-xl border p-4 text-sm">
        <input type="checkbox" checked={adventureSports} onChange={(e) => setAdventureSports(e.target.checked)} />
        Add adventure sports coverage (price updates live)
      </label>

      <PremiumCalculator premium={premium} />

      <button className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60" disabled={!payloadReady} onClick={onPurchase}>
        Continue to payment
      </button>

      {message && <p className="text-sm">{message}</p>}
    </main>
  );
}
