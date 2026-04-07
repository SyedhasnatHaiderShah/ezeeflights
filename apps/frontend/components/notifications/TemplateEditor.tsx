'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth-store';

export function TemplateEditor() {
  const token = useAuthStore((state) => state.accessToken);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    await apiFetch('/notifications/templates', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: form.get('name'),
        type: form.get('type'),
        subject: form.get('subject') || undefined,
        body: form.get('body'),
        variables: String(form.get('variables') ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    });

    setMessage('Template saved successfully');
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded border bg-white p-4">
      <h2 className="text-lg font-semibold">Template Editor</h2>
      <input name="name" required placeholder="Template name" className="w-full rounded border p-2" />
      <select name="type" className="w-full rounded border p-2">
        <option value="EMAIL">EMAIL</option>
        <option value="SMS">SMS</option>
        <option value="WHATSAPP">WHATSAPP</option>
      </select>
      <input name="subject" placeholder="Subject (email)" className="w-full rounded border p-2" />
      <textarea name="body" required placeholder="Template body with {{variable}}" className="h-32 w-full rounded border p-2" />
      <input name="variables" placeholder="variables comma-separated" className="w-full rounded border p-2" />
      <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-white">Save Template</button>
      {message && <p className="text-green-700">{message}</p>}
    </form>
  );
}
