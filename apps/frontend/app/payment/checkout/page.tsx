'use client';

import { useMemo, useState } from 'react';
import { PaymentMethods } from '@/components/payment/PaymentMethods';
import { StripeCheckout } from '@/components/payment/StripeCheckout';
import { BNPLSelector } from '@/components/payment/BNPLSelector';
import { PaymentProvider } from '@/components/payment/types';

export default function CheckoutPage() {
  const [provider, setProvider] = useState<PaymentProvider>('STRIPE');
  const [loading, setLoading] = useState(false);
  const bookingId = useMemo(() => typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('bookingId') : null, []);

  const startPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/payments/initiate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          provider,
          amount: 1,
          currency: 'AED',
          successUrl: `${window.location.origin}/payment/success`,
          failureUrl: `${window.location.origin}/payment/failed`,
        }),
      });

      if (!res.ok) throw new Error('Payment initiation failed');
      const data = (await res.json()) as { redirectUrl: string };
      window.location.href = data.redirectUrl;
    } catch (_error) {
      window.location.href = '/payment/failed';
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">Payment Checkout</h1>
      <PaymentMethods value={provider} onChange={setProvider} />
      <div className="my-4">
        <BNPLSelector provider={provider} />
      </div>
      <StripeCheckout onPay={startPayment} loading={loading} />
    </main>
  );
}
