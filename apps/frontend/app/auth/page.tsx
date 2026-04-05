'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth-store';

interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
}

export default function AuthPage() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.accessToken);
      setMessage('Signed in successfully.');
    } catch {
      setMessage('Sign-in failed. Check credentials or register first.');
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="w-full rounded border p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">
          Login
        </button>
      </form>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </section>
  );
}
