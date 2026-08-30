"use client";

import { AlertTriangle, ShieldCheck, CheckCircle, Info } from "lucide-react";

export function AITravelAlert({ alert }: { alert?: string }) {
  if (!alert) return null;
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-destructive/10 dark:bg-destructive/20 p-4 border border-destructive/30 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-destructive">
          AI Safety Monitor
        </p>
        <p className="font-bold text-sm text-foreground">{alert}</p>
      </div>
    </div>
  );
}

export function VisaHealthCard({ visa, health }: { visa: any; health: any }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {/* Visa Section */}
      <div className="rounded-3xl border border-border bg-card p-3 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-redmix text-white">
            <CheckCircle className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Entry & Visa</h3>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl bg-muted p-3">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground">
              Status
            </p>
            <p className="font-bold text-xs text-foreground">{visa.type}</p>
          </div>
          <p className="text-xs font-medium leading-relaxed text-muted-foreground">
            {visa.description}
          </p>
          <div className="flex items-center justify-end gap-2 text-xs font-bold text-redmix uppercase tracking-widest">
            <Info className="h-5 w-5" /> Validity: {visa.validity}
          </div>
        </div>
      </div>

      {/* Health Section */}
      <div className="rounded-3xl border border-border bg-card p-3 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-redmix text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Health & Safety</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground">
              Recommended Vaccines
            </p>
            <ul className="grid gap-2">
              {health.vaccinations.map((v: string) => (
                <li
                  key={v}
                  className="flex items-center gap-2 text-xs font-semibold text-foreground"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl p-3">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground">
              AI Advisory
            </p>
            <p className="text-xs font-semibold text-foreground">
              {health.advisories}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
