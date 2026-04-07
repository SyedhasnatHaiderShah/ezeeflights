'use client';

import { PaymentProvider } from './types';

interface Props {
  value: PaymentProvider;
  onChange: (value: PaymentProvider) => void;
}

export function PaymentMethods({ value, onChange }: Props) {
  const providers: PaymentProvider[] = ['STRIPE', 'PAYTABS', 'TABBY', 'TAMARA'];
  return (
    <div className="grid grid-cols-2 gap-3">
      {providers.map((provider) => (
        <button
          key={provider}
          type="button"
          onClick={() => onChange(provider)}
          className={`rounded-lg border px-4 py-3 text-sm ${value === provider ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
        >
          {provider}
        </button>
      ))}
    </div>
  );
}
