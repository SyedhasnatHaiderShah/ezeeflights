'use client';

import { FormEvent } from 'react';

export interface TwoFactorFormProps {
  code: string;
  onCodeChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
  error?: string;
}

export function TwoFactorForm({ code, onCodeChange, onSubmit, disabled, error }: TwoFactorFormProps) {
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <p className="text-sm text-slate-600">Enter the 6-digit code from your authenticator app or a backup code.</p>
      <input
        className="w-full rounded border border-slate-300 p-2 tracking-widest"
        placeholder="000000"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => onCodeChange(e.target.value.replace(/\s/g, ''))}
        disabled={disabled}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        type="submit"
        disabled={disabled}
      >
        Verify and continue
      </button>
    </form>
  );
}
