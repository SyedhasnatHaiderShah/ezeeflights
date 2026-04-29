"use client";

import { AlertTriangle, ShieldCheck, CheckCircle, Info } from "lucide-react";

export function AITravelAlert({ alert }: { alert?: string }) {
  if (!alert) return null;
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-amber-50 p-6 border-2 border-amber-100 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">AI Safety Monitor</p>
        <p className="font-bold text-amber-900">{alert}</p>
      </div>
    </div>
  );
}

export function VisaHealthCard({ visa, health }: { visa: any, health: any }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Visa Section */}
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Entry & Visa</h3>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
            <p className="font-bold text-slate-900">{visa.type}</p>
          </div>
          <p className="text-sm font-medium leading-relaxed text-slate-500">{visa.description}</p>
          <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
            <Info className="h-3 w-3" /> Validity: {visa.validity}
          </div>
        </div>
      </div>

      {/* Health Section */}
      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Health & Safety</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recommended Vaccines</p>
            <ul className="grid gap-2">
              {health.vaccinations.map((v: string) => (
                <li key={v} className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">AI Advisory</p>
            <p className="text-sm font-bold text-emerald-900">{health.advisories}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
