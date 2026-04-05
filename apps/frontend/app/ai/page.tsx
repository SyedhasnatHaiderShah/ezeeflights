'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api/client';

interface AssistantResponse {
  answer: string;
  nextActions: string[];
}

export default function AiAssistantPage() {
  const [prompt, setPrompt] = useState('Plan a 5-day London trip under $2000');
  const [response, setResponse] = useState<AssistantResponse | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await apiFetch<AssistantResponse>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    setResponse(result);
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">AI Travel Assistant</h1>
      <form className="space-y-2" onSubmit={onSubmit}>
        <textarea className="w-full rounded border p-2" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button className="rounded bg-indigo-600 px-4 py-2 text-white" type="submit">
          Ask AI
        </button>
      </form>

      {response && (
        <article className="rounded border bg-white p-4">
          <p>{response.answer}</p>
          <ul className="mt-2 list-disc pl-6">
            {response.nextActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}
