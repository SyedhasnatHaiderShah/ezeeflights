'use client';

import { FormEvent, useState } from 'react';

export function TicketReplyBox({ onSubmit }: { onSubmit: (payload: { body: string; attachments: Array<{ name: string }> }) => Promise<void> }) {
  const [body, setBody] = useState('');
  const [fileName, setFileName] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ body, attachments: fileName ? [{ name: fileName }] : [] });
      setBody('');
      setFileName('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-2 rounded-lg border bg-white p-4" onSubmit={submit}>
      <textarea
        className="min-h-28 w-full rounded border p-2"
        placeholder="Write your message..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <input className="w-full rounded border p-2 text-sm" type="text" placeholder="Attachment filename (optional)" value={fileName} onChange={(e) => setFileName(e.target.value)} />
      <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={saving} type="submit">
        {saving ? 'Sending...' : 'Send Reply'}
      </button>
    </form>
  );
}
