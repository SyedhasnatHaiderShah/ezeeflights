'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingSummary } from '@/components/packages/BookingSummary';
import { TravelerForm } from '@/components/packages/TravelerForm';
import { bookPackage, listPackages } from '@/lib/api/packages-api';

export default function PackageBookingPage() {
  const searchParams = useSearchParams();
  const packageId = useMemo(() => searchParams.get('id') ?? '', [searchParams]);
  const [counts, setCounts] = useState({ adult: 1, child: 0, infant: 0 });
  const [pricing, setPricing] = useState({ adultPrice: 0, childPrice: 0, infantPrice: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    listPackages().then((res) => {
      const found = res.data.find((item) => item.id === packageId);
      if (!found) return;
      setPricing({ adultPrice: found.basePrice, childPrice: found.basePrice * 0.75, infantPrice: found.basePrice * 0.2 });
    }).catch(() => undefined);
  }, [packageId]);

  const onSubmit = async () => {
    const travelers = [
      ...Array.from({ length: counts.adult }, (_, i) => ({ type: 'adult', fullName: `Adult ${i + 1}` })),
      ...Array.from({ length: counts.child }, (_, i) => ({ type: 'child', fullName: `Child ${i + 1}` })),
      ...Array.from({ length: counts.infant }, (_, i) => ({ type: 'infant', fullName: `Infant ${i + 1}` })),
    ];

    try {
      const response = await bookPackage(packageId, {
        travelers,
        paymentProvider: 'STRIPE',
        successUrl: `${window.location.origin}/payment/success`,
        failureUrl: `${window.location.origin}/payment/failed`,
      });
      setMessage(`Booking created. Continue payment: ${(response as any)?.payment?.redirectUrl ?? 'N/A'}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Book Package</h1>
      <TravelerForm counts={counts} onChange={setCounts} />
      <BookingSummary counts={counts} pricing={pricing} />
      <button onClick={onSubmit} className="rounded bg-blue-600 px-4 py-2 text-white">Proceed to payment</button>
      {message && <p className="text-sm">{message}</p>}
    </section>
  );
}
