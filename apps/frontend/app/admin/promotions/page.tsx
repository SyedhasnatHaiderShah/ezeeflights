'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin/admin-shell';
import {
  AdminPromotion,
  AdminPromotionKind,
  deleteAdminCampaign,
  deleteAdminCoupon,
  listAdminCampaigns,
  listAdminCoupons,
  saveAdminCampaign,
  saveAdminCoupon,
} from '@/lib/api/admin-api';

const emptyPromotion = (): AdminPromotion => ({
  code: '',
  title: '',
  description: '',
  kind: 'PERCENT',
  value: 10,
  active: true,
  autoApply: false,
  flashSale: false,
  redeemedCount: 0,
});

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="block font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function toLocalInput(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIso(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export default function PromotionsAdminPage() {
  const couponsQuery = useQuery({ queryKey: ['admin-coupons'], queryFn: listAdminCoupons });
  const campaignsQuery = useQuery({ queryKey: ['admin-campaigns'], queryFn: listAdminCampaigns });
  const [mode, setMode] = useState<'coupon' | 'campaign'>('coupon');
  const [form, setForm] = useState<AdminPromotion>(emptyPromotion());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const items = useMemo(() => (mode === 'coupon' ? couponsQuery.data ?? [] : campaignsQuery.data ?? []), [mode, couponsQuery.data, campaignsQuery.data]);

  const setField = <K extends keyof AdminPromotion>(key: K, value: AdminPromotion[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setForm(emptyPromotion());

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      if (!form.code.trim() || !form.title.trim()) throw new Error('Code and title are required.');
      const payload = { ...form, code: form.code.trim().toUpperCase(), title: form.title.trim(), startsAt: toIso(form.startsAt), endsAt: toIso(form.endsAt) };
      if (mode === 'coupon') await saveAdminCoupon(payload); else await saveAdminCampaign(payload);
      await Promise.all([couponsQuery.refetch(), campaignsQuery.refetch()]);
      setMessage(`${payload.code} saved successfully.`);
      reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save promotion.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (code: string) => {
    setSaving(true);
    setMessage('');
    try {
      if (mode === 'coupon') await deleteAdminCoupon(code); else await deleteAdminCampaign(code);
      await Promise.all([couponsQuery.refetch(), campaignsQuery.refetch()]);
      setMessage(`${code} deleted.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete promotion.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Promotions & Coupons</h1>
          <p className="text-sm text-slate-500">Create checkout discounts, seasonal campaigns, and flash-sale pricing.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setMode('coupon')} className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'coupon' ? 'bg-brand-red text-white' : 'border bg-white'}`}>Coupons</button>
          <button onClick={() => setMode('campaign')} className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'campaign' ? 'bg-brand-red text-white' : 'border bg-white'}`}>Campaigns</button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold">{mode === 'coupon' ? 'Coupon editor' : 'Campaign editor'}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Code">
                <input value={form.code} onChange={(e) => setField('code', e.target.value.toUpperCase())} className="w-full rounded-lg border px-3 py-2" />
              </Field>
              <Field label="Title">
                <input value={form.title} onChange={(e) => setField('title', e.target.value)} className="w-full rounded-lg border px-3 py-2" />
              </Field>
              <Field label="Type">
                <select value={form.kind} onChange={(e) => setField('kind', e.target.value as AdminPromotionKind)} className="w-full rounded-lg border px-3 py-2">
                  <option value="PERCENT">Percentage</option>
                  <option value="FIXED">Fixed amount</option>
                </select>
              </Field>
              <Field label="Value">
                <input type="number" value={form.value} onChange={(e) => setField('value', Number(e.target.value))} className="w-full rounded-lg border px-3 py-2" />
              </Field>
              <Field label="Description">
                <input value={form.description ?? ''} onChange={(e) => setField('description', e.target.value)} className="w-full rounded-lg border px-3 py-2 md:col-span-2" />
              </Field>
              <Field label="Start date">
                <input type="datetime-local" value={toLocalInput(form.startsAt)} onChange={(e) => setField('startsAt', e.target.value || undefined)} className="w-full rounded-lg border px-3 py-2" />
              </Field>
              <Field label="End date">
                <input type="datetime-local" value={toLocalInput(form.endsAt)} onChange={(e) => setField('endsAt', e.target.value || undefined)} className="w-full rounded-lg border px-3 py-2" />
              </Field>
              <Field label="Minimum subtotal">
                <input type="number" value={form.minSubtotal ?? ''} onChange={(e) => setField('minSubtotal', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-lg border px-3 py-2" />
              </Field>
              <Field label="Minimum travelers">
                <input type="number" value={form.minTravelers ?? ''} onChange={(e) => setField('minTravelers', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-lg border px-3 py-2" />
              </Field>
              <Field label="Partner code">
                <input value={form.partnerCode ?? ''} onChange={(e) => setField('partnerCode', e.target.value)} className="w-full rounded-lg border px-3 py-2" />
              </Field>
              <Field label="Campaign tag">
                <input value={form.campaignTag ?? ''} onChange={(e) => setField('campaignTag', e.target.value)} className="w-full rounded-lg border px-3 py-2" />
              </Field>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active ?? false} onChange={(e) => setField('active', e.target.checked)} /> Active</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.autoApply ?? false} onChange={(e) => setField('autoApply', e.target.checked)} /> Auto apply</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.flashSale ?? false} onChange={(e) => setField('flashSale', e.target.checked)} /> Flash sale</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.firstBookingOnly ?? false} onChange={(e) => setField('firstBookingOnly', e.target.checked)} /> First booking only</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.memberOnly ?? false} onChange={(e) => setField('memberOnly', e.target.checked)} /> Member only</label>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button onClick={save} disabled={saving} className="rounded-xl bg-brand-red px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save promotion'}</button>
              <button onClick={reset} className="rounded-xl border px-4 py-2 font-semibold">Reset</button>
              {message ? <p className="text-sm text-slate-600">{message}</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold">Existing {mode === 'coupon' ? 'coupons' : 'campaigns'}</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.code} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.code}</p>
                      <p className="text-sm text-slate-500">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.description || 'No description'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setForm(item)} className="rounded-lg border px-3 py-1 text-xs font-semibold">Edit</button>
                      <button onClick={() => remove(item.code)} className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600">Delete</button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{item.kind}</span>
                    {item.autoApply ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">Auto</span> : null}
                    {item.flashSale ? <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Flash sale</span> : null}
                    {item.memberOnly ? <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-700">Member</span> : null}
                  </div>
                </div>
              ))}
              {items.length === 0 ? <p className="text-sm text-slate-500">No promotions configured yet.</p> : null}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
