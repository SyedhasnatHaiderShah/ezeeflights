'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { CountdownTimer } from '@/components/ui/countdown-timer';

export default function DealsPage() {
  const [tab, setTab] = useState('Flights');
  const expiresAt = useMemo(() => new Date(Date.now() + 1000 * 60 * 60 * 30), []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow space-y-7 pt-24">
        <section className="bg-gradient-to-br from-[#072f66] to-[#0b3f85] px-6 py-14 text-white">
          <div className="mx-auto max-w-6xl space-y-5">
            <h1 className="text-4xl font-black">Exclusive Deals</h1>
            <div className="flex flex-wrap gap-2">{['Flights', 'Hotels', 'Packages', 'Flash Sales'].map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm ${tab === t ? 'bg-white text-[#072f66]' : 'border border-white/50'}`}>{t}</button>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-4 px-6 pb-12">
          {tab === 'Flash Sales' ? <div className="grid gap-4 md:grid-cols-3">{[1,2,3,4,5,6].map((i) => <article key={i} className="rounded-2xl border p-4"><p className="font-semibold">Flash Deal #{i}</p><CountdownTimer expiresAt={expiresAt} className="mt-2" /></article>)}</div> : <p className="rounded-xl border p-4">{tab} deals loaded.</p>}
          <div className="space-y-2"><h2 className="font-bold text-brand-red">Ending soon</h2><div className="flex gap-3 overflow-x-auto pb-2">{[1,2,3,4].map((i) => <div key={i} className="min-w-64 rounded-xl border-2 border-brand-red p-3">Urgent offer {i}</div>)}</div></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
