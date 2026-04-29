'use client';

interface Props {
  subtotal: number;
  currency: string;
  discountAmount?: number;
  discountLabel?: string;
  walletBalance: number;
  useWallet: boolean;
  onToggleWallet: (enabled: boolean) => void;
}

function currencySymbol(currency: string) {
  return currency === 'AED' ? 'AED ' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
}

export function CheckoutSummary({ subtotal, currency, discountAmount = 0, discountLabel, walletBalance, useWallet, onToggleWallet }: Props) {
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const walletApplied = useWallet ? Math.min(discountedSubtotal, walletBalance) : 0;
  const remaining = Math.max(0, discountedSubtotal - walletApplied);
  const symbol = currencySymbol(currency);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Checkout Summary</h2>
      <label className="mb-3 flex items-center justify-between rounded-xl border p-3">
        <span className="text-sm font-medium">Use ezeeFlight Wallet</span>
        <input type="checkbox" checked={useWallet} onChange={(e) => onToggleWallet(e.target.checked)} className="h-4 w-4" />
      </label>
      <p className="text-sm text-muted-foreground">Available balance: {symbol}{walletBalance.toFixed(2)}</p>
      <div className="mt-3 space-y-1 text-sm">
        <p className="flex justify-between"><span>Subtotal</span><span>{symbol}{subtotal.toFixed(2)}</span></p>
        <p className="flex justify-between"><span>Promo discount</span><span>- {symbol}{discountAmount.toFixed(2)}</span></p>
        {discountLabel ? <p className="text-xs font-medium text-emerald-700">{discountLabel}</p> : null}
        <p className="flex justify-between"><span>Wallet deduction</span><span>- {symbol}{walletApplied.toFixed(2)}</span></p>
        <p className="flex justify-between font-semibold text-base"><span>Card charge</span><span>{symbol}{remaining.toFixed(2)}</span></p>
      </div>
      {walletApplied > 0 && remaining > 0 && <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-xs font-medium text-emerald-700">Split Payment</p>}
    </div>
  );
}
