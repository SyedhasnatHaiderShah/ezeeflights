'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/register-form';
import { registerRequest } from '@/lib/api/auth-api';
import { queryClient } from '@/lib/query/query-client';

export function RegisterContainer() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await registerRequest({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['auth-session'] });
      router.push('/dashboard');
    } catch {
      setError('Registration failed. Email may already be in use.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <RegisterForm
      email={email}
      password={password}
      firstName={firstName}
      lastName={lastName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onSubmit={onSubmit}
      disabled={busy}
      error={error}
    />
  );
}
