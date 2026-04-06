'use client';

import { FormEvent } from 'react';

export interface RegisterFormProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
  error?: string;
}

export function RegisterForm({
  email,
  password,
  firstName,
  lastName,
  onEmailChange,
  onPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  disabled,
  error,
}: RegisterFormProps) {
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
        placeholder="Password (min 8 characters)"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        disabled={disabled}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          className="w-full rounded border border-slate-300 p-2"
          placeholder="First name (optional)"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          disabled={disabled}
        />
        <input
          className="w-full rounded border border-slate-300 p-2"
          placeholder="Last name (optional)"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        className="w-full rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
        type="submit"
        disabled={disabled}
      >
        Create account
      </button>
    </form>
  );
}
