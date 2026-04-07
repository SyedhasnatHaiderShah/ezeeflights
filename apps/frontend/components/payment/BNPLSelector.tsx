'use client';

import { PaymentProvider } from './types';

interface Props {
  provider: PaymentProvider;
}

export function BNPLSelector({ provider }: Props) {
  if (provider !== 'TABBY' && provider !== 'TAMARA') {
    return null;
  }

  return (
    <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
      {provider} installments will be shown at provider checkout.
    </div>
  );
}
