'use client';

interface Props {
  onPay: () => Promise<void>;
  loading: boolean;
}

export function StripeCheckout({ onPay, loading }: Props) {
  return (
    <button
      type="button"
      onClick={onPay}
      disabled={loading}
      className="w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-60"
    >
      {loading ? 'Processing...' : 'Pay with selected method'}
    </button>
  );
}
