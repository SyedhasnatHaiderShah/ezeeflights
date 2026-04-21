"use client";

import { useState } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeals, useFlashDeals } from "@/lib/api/deals";

export default function DealsPage() {
  const [tab, setTab] = useState("Flights");
  const type = tab === "Hotels" ? "hotel" : tab === "Packages" ? "package" : tab === "Flights" ? "flight" : undefined;
  const { data: deals = [], isLoading } = useDeals({ type });
  const { data: flashDeals = [], isLoading: isFlashLoading } = useFlashDeals(6);

  const activeDeals = tab === "Flash Sales" ? flashDeals : deals;
  const activeLoading = tab === "Flash Sales" ? isFlashLoading : isLoading;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow space-y-7 pt-24">
        <section className="bg-gradient-to-br from-[#072f66] to-[#0b3f85] px-6 py-14 text-white">
          <div className="mx-auto max-w-6xl space-y-5">
            <h1 className="text-4xl font-black">Exclusive Deals</h1>
            <div className="flex flex-wrap gap-2">{["Flights", "Hotels", "Packages", "Flash Sales"].map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm ${tab === t ? "bg-white text-[#072f66]" : "border border-white/50"}`}>{t}</button>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl space-y-4 px-6 pb-12">
          <div className="grid gap-4 md:grid-cols-3">{activeLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />) : activeDeals.map((deal) => <article key={deal.id} className="rounded-2xl border p-4"><p className="font-semibold">{deal.title}</p><p className="text-sm text-muted-foreground">{deal.originCity ? `${deal.originCity} → ` : ""}{deal.destinationCity}</p>{deal.expiresAt ? <CountdownTimer expiresAt={new Date(deal.expiresAt)} className="mt-2" /> : null}</article>)}</div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
