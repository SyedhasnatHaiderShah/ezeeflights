'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const res = await fetch('/api/v1/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    const payload = await res.json();
    localStorage.setItem('admin_access_token', payload.accessToken);
    router.push('/admin/dashboard');
  }

  return (
    <div className="mx-auto max-w-md mt-20 border rounded p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input name="email" type="email" placeholder="Email" className="w-full border p-2 rounded" required />
        <input name="password" type="password" placeholder="Password" className="w-full border p-2 rounded" required />
        <button className="w-full bg-black text-white rounded p-2" type="submit">Sign in</button>
      </form>
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
}
