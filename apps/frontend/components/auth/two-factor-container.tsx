'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TwoFactorForm } from '@/components/auth/two-factor-form';
import { verifyTwoFactorLoginRequest } from '@/lib/api/auth-api';
import { queryClient } from '@/lib/query/query-client';

export function TwoFactorContainer() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await verifyTwoFactorLoginRequest({ code });
      await queryClient.invalidateQueries({ queryKey: ['auth-session'] });
      router.push('/dashboard');
    } catch {
      setError('Invalid code or expired challenge. Sign in again if needed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <TwoFactorForm
      code={code}
      onCodeChange={setCode}
      onSubmit={onSubmit}
      disabled={busy}
      error={error}
    />
  );
}
