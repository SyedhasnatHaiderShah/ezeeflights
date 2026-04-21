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
  const walletQuery = useQuery<{ balance: number }>({ queryKey: ['wallet-balance'], queryFn: () => apiFetch('/payments/wallet/me') });
  const bookingQuery = useQuery<{ totalAmount: number; currency: string }>({ queryKey: ['booking', bookingId], queryFn: () => apiFetch(`/bookings/me/${bookingId}`), enabled: !!bookingId });
  const total = bookingQuery.data?.totalAmount ?? 0;
  const currency = bookingQuery.data?.currency ?? 'AED';
  const walletBalance = walletQuery.data?.balance ?? 0;
  const walletApplied = useWallet ? Math.min(total, walletBalance) : 0;

  const startPayment = async () => {
    setLoading(true);
    try {
      const data = (await initiatePayment({ bookingId: String(bookingId), provider, amount: total, currency, useWalletAmount: walletApplied, paymentMethodId: 'pm_card_visa', successUrl: `${window.location.origin}/payment/success`, failureUrl: `${window.location.origin}/payment/failed` })) as { redirectUrl?: string; requiresAction?: boolean; paymentId: string };
      if (data.redirectUrl) window.location.href = data.redirectUrl; else window.location.href = `/payment/complete?payment_id=${data.paymentId}`;
    } catch (_error) { window.location.href = '/payment/failed'; } finally { setLoading(false); }
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-4 p-6 lg:grid-cols-[5fr_3fr_2fr]">
      <section className="space-y-4 rounded-2xl border p-5"><h1 className="text-2xl font-semibold">Payment Methods</h1><PaymentMethods value={provider} onChange={setProvider} /><div className="rounded-xl border p-3"><p className="mb-2 text-sm font-medium">Credit / Debit Card (Stripe)</p><StripeCheckout onPay={startPayment} loading={loading} /></div><div className="rounded-xl border p-3"><p className="mb-2 text-sm font-medium">PayPal</p><button className="rounded bg-[#0070ba] px-4 py-2 text-white">Pay with PayPal</button></div><div className="rounded-xl border p-3"><p className="mb-2 text-sm font-medium">Wallet Balance</p><CheckoutSummary total={total} walletBalance={walletBalance} useWallet={useWallet} onToggleWallet={setUseWallet} /></div><BNPLSelector provider={provider} /></section>
      <section className="space-y-4 rounded-2xl border p-5"><h2 className="text-xl font-bold">Order Summary</h2><div className="rounded-xl border p-3 text-sm"><p>Flight + Hotel</p><p className="text-slate-500">Booking #{bookingId || 'N/A'}</p></div><div className="space-y-2 text-sm"><p className="flex justify-between"><span>Subtotal</span><span>{currency} {total.toFixed(2)}</span></p><p className="flex justify-between"><span>Wallet</span><span>- {currency} {walletApplied.toFixed(2)}</span></p><p className="flex justify-between font-bold"><span>Total</span><span>{currency} {(total - walletApplied).toFixed(2)}</span></p></div><input className="w-full rounded border p-2 text-sm" placeholder="Promo code" /></section>
      <aside className="space-y-3 rounded-2xl border p-5 text-sm"><p>🔒 Secure checkout</p><p>256-bit SSL encryption</p><p>Money-back guarantee</p><p>Support: support@ezeeflights.com</p></aside>
    </main>
  );
}
