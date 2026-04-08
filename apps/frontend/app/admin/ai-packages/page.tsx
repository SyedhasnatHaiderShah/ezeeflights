'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin/admin-shell';
import { AIInputForm } from '@/components/packages/AIInputForm';
import { EditableItineraryBuilder, ItineraryOverride } from '@/components/packages/EditableItineraryBuilder';
import { ItineraryPreview } from '@/components/packages/ItineraryPreview';
import { PricingPreview } from '@/components/packages/PricingPreview';
import { approveAiPackage, convertAiPackage, generateAiPackage, listAiPackages, rejectAiPackage } from '@/lib/api/ai-itinerary-api';

export default function AdminAiPackagesPage() {
  const [selectedId, setSelectedId] = useState<string>('');
  const [overrides, setOverrides] = useState<Record<number, ItineraryOverride>>({});

  const listQ = useQuery({ queryKey: ['admin-ai-packages'], queryFn: listAiPackages });
  const selected = useMemo(() => listQ.data?.find((p) => p.id === selectedId) ?? listQ.data?.[0], [listQ.data, selectedId]);

  const generateM = useMutation({ mutationFn: generateAiPackage, onSuccess: () => listQ.refetch() });
  const approveM = useMutation({ mutationFn: (id: string) => approveAiPackage(id), onSuccess: () => listQ.refetch() });
  const rejectM = useMutation({ mutationFn: (id: string) => rejectAiPackage(id), onSuccess: () => listQ.refetch() });
  const convertM = useMutation({
    mutationFn: (id: string) => convertAiPackage(id, { status: 'published', itineraryOverrides: Object.values(overrides) } as any),
    onSuccess: () => listQ.refetch(),
  });

  return (
    <AdminShell>
      <h1 className="mb-4 text-2xl font-bold">AI Itinerary Generator</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <AIInputForm loading={generateM.isPending} onSubmit={async (payload) => { const res = await generateM.mutateAsync(payload); setSelectedId(res.id); }} />
        <div className="rounded border bg-white p-4">
          <h3 className="mb-2 font-semibold">Generated Drafts</h3>
          <div className="space-y-2">
            {(listQ.data ?? []).map((pkg) => (
              <button key={pkg.id} className={`block w-full rounded border p-2 text-left ${selected?.id === pkg.id ? 'border-blue-600' : ''}`} onClick={() => setSelectedId(pkg.id)}>
                <p className="font-medium">{pkg.generatedOutput.title}</p>
                <p className="text-xs text-slate-500">{pkg.status} • {String(pkg.inputPayload.destination ?? '')}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ItineraryPreview data={selected?.generatedOutput} />
        <PricingPreview pricing={selected?.generatedOutput.pricing} />
      </div>

      <div className="mt-4">
        <EditableItineraryBuilder
          data={selected?.generatedOutput}
          onChange={(rows) => setOverrides((prev) => ({ ...prev, [rows[0].day]: { ...(prev[rows[0].day] ?? {}), ...rows[0] } }))}
        />
      </div>

      {selected ? (
        <div className="mt-4 flex gap-2">
          <button className="rounded bg-emerald-600 px-3 py-2 text-white" onClick={() => approveM.mutate(selected.id)}>Approve</button>
          <button className="rounded bg-rose-600 px-3 py-2 text-white" onClick={() => rejectM.mutate(selected.id)}>Reject</button>
          <button
            className="rounded bg-blue-600 px-3 py-2 text-white"
            onClick={() => convertM.mutate(selected.id)}
          >
            Convert & Publish
          </button>
        </div>
      ) : null}
    </AdminShell>
  );
}
