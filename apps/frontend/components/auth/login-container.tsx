'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { loginRequest } from '@/lib/api/auth-api';
import { queryClient } from '@/lib/query/query-client';

export function LoginContainer() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await loginRequest({ email, password });
      await queryClient.invalidateQueries({ queryKey: ['auth-session'] });
      if ('requiresTwoFactor' in result && result.requiresTwoFactor) {
        router.push('/2fa');
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Sign-in failed. Check credentials or complete two-factor if required.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <LoginForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onSubmit}
        disabled={busy}
        error={error}
      />
      <OAuthButtons />
    </div>
  );
}
