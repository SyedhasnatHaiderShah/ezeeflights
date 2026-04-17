'use client';

interface Props {
  total: number;
  walletBalance: number;
  useWallet: boolean;
  onToggleWallet: (enabled: boolean) => void;
}

export function CheckoutSummary({ total, walletBalance, useWallet, onToggleWallet }: Props) {
  const walletApplied = useWallet ? Math.min(total, walletBalance) : 0;
  const remaining = Math.max(0, total - walletApplied);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Checkout Summary</h2>
      <label className="mb-3 flex items-center justify-between rounded-xl border p-3">
        <span className="text-sm font-medium">Use ezeeFlight Wallet</span>
        <input type="checkbox" checked={useWallet} onChange={(e) => onToggleWallet(e.target.checked)} className="h-4 w-4" />
      </label>
      <p className="text-sm text-muted-foreground">Available balance: ${walletBalance.toFixed(2)}</p>
      <div className="mt-3 space-y-1 text-sm">
        <p className="flex justify-between"><span>Total</span><span>${total.toFixed(2)}</span></p>
        <p className="flex justify-between"><span>Wallet deduction</span><span>- ${walletApplied.toFixed(2)}</span></p>
        <p className="flex justify-between font-semibold text-base"><span>Card charge</span><span>${remaining.toFixed(2)}</span></p>
      </div>
      {walletApplied > 0 && remaining > 0 && <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-xs font-medium text-emerald-700">Split Payment</p>}
    </div>
  );
}
