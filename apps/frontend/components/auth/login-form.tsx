'use client';

import { FormEvent } from 'react';

export interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
  error?: string;
}

export function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  disabled,
  error,
}: LoginFormProps) {
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        className="w-full rounded border border-slate-300 p-2"
        placeholder="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        disabled={disabled}
      />
      <input
        className="w-full rounded border border-slate-300 p-2"
        placeholder="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        disabled={disabled}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        type="submit"
        disabled={disabled}
      >
        Sign in
      </button>
    </form>
  );
}
