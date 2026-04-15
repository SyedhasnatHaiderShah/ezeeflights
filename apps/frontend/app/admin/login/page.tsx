'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError('');
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(values),
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    if (!response.ok) {
      setServerError(payload.message ?? 'Invalid credentials');
      return;
    }

    router.push('/admin/dashboard');
  });

  return (
    <div className="mx-auto mt-20 max-w-md rounded border p-6">
      <h1 className="mb-4 text-2xl font-bold">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input {...form.register('email')} type="email" placeholder="Email" className="w-full rounded border p-2" />
        {form.formState.errors.email && <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>}

        <input {...form.register('password')} type="password" placeholder="Password" className="w-full rounded border p-2" />
        {form.formState.errors.password && <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>}

        <button className="w-full rounded bg-black p-2 text-white disabled:opacity-60" type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      {serverError && <p className="mt-3 text-red-600">{serverError}</p>}
    </div>
  );
}
