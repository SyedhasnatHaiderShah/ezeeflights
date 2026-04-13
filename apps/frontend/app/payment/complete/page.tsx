'use client';

import { useEffect, useMemo, useState } from 'react';

export default function PaymentCompletePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    const paymentId = params.get('payment_id');
    const paymentIntent = params.get('payment_intent') ?? undefined;
    if (!paymentId) {
      setStatus('failed');
      return;
    }

    fetch(`/api/v1/payments/${paymentId}/confirm`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: paymentIntent }),
    })
      .then((res) => {
        setStatus(res.ok ? 'success' : 'failed');
      })
      .catch(() => setStatus('failed'));
  }, [params]);

  return (
    <main className="mx-auto max-w-xl p-8">
      {status === 'loading' && <p>Finalizing secure payment…</p>}
      {status === 'success' && <p className="text-emerald-700">Payment confirmed successfully.</p>}
      {status === 'failed' && <p className="text-red-600">Unable to confirm payment. Please contact support.</p>}
    </main>
  );
}
