'use client';

import { useMemo, useState } from 'react';
import { PaymentMethods } from '@/components/payment/PaymentMethods';
import { StripeCheckout } from '@/components/payment/StripeCheckout';
import { BNPLSelector } from '@/components/payment/BNPLSelector';
import { PaymentProvider } from '@/components/payment/types';
import { CheckoutSummary } from '@/components/payment/CheckoutSummary';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { initiatePayment } from '@/lib/api/payments';

export default function CheckoutPage() {
  const [provider, setProvider] = useState<PaymentProvider>('STRIPE');
  const [loading, setLoading] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const bookingId = useMemo(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('bookingId') : null), []);

  const walletQuery = useQuery<{ balance: number }>({
    queryKey: ['wallet-balance'],
    queryFn: () => apiFetch('/payments/wallet/me'),
  });

  const bookingQuery = useQuery<{ totalAmount: number; currency: string }>({
    queryKey: ['booking', bookingId],
    queryFn: () => apiFetch(`/bookings/me/${bookingId}`),
    enabled: !!bookingId,
  });

  const total = bookingQuery.data?.totalAmount ?? 0;
  const currency = bookingQuery.data?.currency ?? 'AED';
  const walletBalance = walletQuery.data?.balance ?? 0;
  const walletApplied = useWallet ? Math.min(total, walletBalance) : 0;

  const startPayment = async () => {
    setLoading(true);
    try {
      const data = (await initiatePayment({
        bookingId: String(bookingId),
        provider,
        amount: total,
        currency,
        useWalletAmount: walletApplied,
        paymentMethodId: 'pm_card_visa',
        successUrl: `${window.location.origin}/payment/success`,
        failureUrl: `${window.location.origin}/payment/failed`,
      })) as { redirectUrl?: string; requiresAction?: boolean; paymentId: string };
      if (data.requiresAction && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      window.location.href = `/payment/complete?payment_id=${data.paymentId}`;
    } catch (_error) {
      window.location.href = '/payment/failed';
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Payment Checkout</h1>
      <CheckoutSummary total={total} walletBalance={walletBalance} useWallet={useWallet} onToggleWallet={setUseWallet} />
      <PaymentMethods value={provider} onChange={setProvider} />
      <div className="my-4">
        <BNPLSelector provider={provider} />
      </div>
      <StripeCheckout onPay={startPayment} loading={loading} />
    </main>
  );
}
