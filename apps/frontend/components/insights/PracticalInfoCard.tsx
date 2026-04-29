"use client";

import { Globe, PhoneCall, Wallet, Wifi, Coffee, Building, Train, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PracticalInfoCard({ practical }: { practical: any }) {
  const infoItems = [
    { icon: Globe, label: "Currency", value: practical.currency, sub: practical.exchangeRate },
    { icon: Wifi, label: "Connectivity", value: practical.connectivity, sub: practical.simCost },
    { icon: Coffee, label: "Language & Culture", value: practical.language, sub: practical.religion },
  ];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="mb-8 border-b border-slate-50 pb-6">
        <h3 className="text-xl font-black text-slate-900">Practical Intelligence</h3>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        {infoItems.map((item) => (
          <div key={item.label} className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
              <p className="font-bold text-slate-900 leading-tight">{item.value}</p>
              <p className="text-xs font-medium text-slate-500">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 rounded-2xl bg-slate-900 p-6 text-white md:grid-cols-3">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Emergency Police</p>
          <p className="text-lg font-black">{practical.emergency.police}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Emergency Medical</p>
          <p className="text-lg font-black">{practical.emergency.medical}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Global Assistance</p>
          <div className="flex items-center gap-2">
            <PhoneCall className="h-3 w-3 text-brand-red" />
            <p className="text-xs font-bold">{practical.emergency.embassy}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CostGuideCard({ costs }: { costs: any }) {
  const costRows = [
    { icon: Coffee, label: "Meals", value: costs.meals },
    { icon: Building, label: "Accommodation", value: costs.accommodation },
    { icon: Train, label: "Transport", value: costs.transport },
  ];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="mb-8 flex items-center justify-between border-b border-slate-50 pb-6">
        <h3 className="text-xl font-black text-slate-900">Cost of Discovery</h3>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700 uppercase tracking-widest">
           Average Daily Cost
        </div>
      </div>

      <div className="space-y-6">
        {costRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                <row.icon className="h-5 w-5" />
              </div>
              <p className="font-bold text-slate-600">{row.label}</p>
            </div>
            <p className="font-black text-slate-900">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estimated Daily Total</p>
        <p className="text-3xl font-black text-brand-red">{costs.dailyTotal}</p>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-dashed border-slate-100 p-4">
        <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tipping Culture</p>
          <p className="text-sm font-bold text-slate-600">{costs.tipping}</p>
        </div>
      </div>
    </div>
  );
}
