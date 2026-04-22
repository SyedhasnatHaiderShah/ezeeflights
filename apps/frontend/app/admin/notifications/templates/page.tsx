'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { TemplateEditor } from '@/components/notifications/TemplateEditor';

interface Template {
  id: string;
  name: string;
  type: string;
  subject: string | null;
  body: string;
}

export default function NotificationTemplatesPage() {
  // Auth is handled server-side via HttpOnly cookie — no client-side token needed.
  const templateQuery = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => apiFetch<Template[]>('/notifications/templates'),
  });

  return (
    <section className="space-y-4">
      <TemplateEditor />
      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Existing Templates</h2>
        <ul className="space-y-2 text-sm">
          {templateQuery.data?.map((template) => (
            <li key={template.id} className="rounded border p-2">
              <p className="font-semibold">{template.name} ({template.type})</p>
              <p>{template.subject ?? 'No subject'}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
