"use client";

import { CloudRain, Sun, Users, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClimateChart({ climate }: { climate: any[] }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="mb-8 border-b border-slate-50 pb-6">
        <h3 className="text-xl font-black text-slate-900">Climate & Seasonal Guide</h3>
      </div>

      <div className="flex items-end justify-between gap-2 h-48 mb-8">
        {climate.map((data) => (
          <div key={data.month} className="flex flex-col items-center flex-1 gap-4">
            <div className="relative w-full flex flex-col items-center justify-end gap-1 group">
               {/* Temp Bar */}
               <div 
                style={{ height: `${(data.temp / 45) * 100}%` }}
                className="w-full max-w-[30px] rounded-t-lg bg-orange-400 transition-all group-hover:bg-brand-red"
               />
               {/* Rain Bar */}
               <div 
                style={{ height: `${(data.rainfall / 50) * 100}%` }}
                className="w-full max-w-[30px] rounded-t-lg bg-blue-400 opacity-30 absolute bottom-0"
               />
               <span className="absolute -top-6 text-[10px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {data.temp}°C
               </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{data.month}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-orange-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Temperature</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-400 opacity-30" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rainfall</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-slate-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Crowd Levels</span>
        </div>
      </div>
    </div>
  );
}

export function AIComparisonTool({ comparison }: { comparison: any }) {
  const dests = Object.keys(comparison.scores);
  
  return (
    <section className="space-y-8 rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-red">
            <Sparkles className="h-4 w-4" />
            AI Trip Decision Support
          </div>
          <h2 className="text-4xl font-black tracking-tight">Compare <span className="text-brand-red">Destinations</span></h2>
          <p className="text-slate-400 font-medium max-w-lg">Let our AI analyze 10 key parameters to help you choose your next journey.</p>
        </div>
        
        <div className="flex gap-4">
          {dests.map(d => (
            <div key={d} className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <div className={cn("h-3 w-3 rounded-full", d === "Dubai" ? "bg-brand-red" : "bg-blue-400")} />
              <span className="text-sm font-black uppercase tracking-widest">{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {comparison.params.map((param: string, i: number) => {
          const score1 = comparison.scores[dests[0]][i];
          const score2 = comparison.scores[dests[1]][i];
          const winner = score1 > score2 ? dests[0] : dests[1];

          return (
            <div key={param} className="group relative flex flex-col gap-3 rounded-2xl bg-white/5 p-6 transition-all hover:bg-white/10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{param}</p>
                <div className="flex items-center gap-2">
                  <Trophy className={cn("h-3 w-3", winner === "Dubai" ? "text-brand-red" : "text-blue-400")} />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">AI Favorite: {winner}</span>
                </div>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div 
                  style={{ width: `${score1 * 10}%` }}
                  className="absolute left-0 top-0 h-full bg-brand-red transition-all duration-1000"
                />
                <div 
                  style={{ width: `${score2 * 10}%` }}
                  className="absolute left-0 top-0 h-full bg-blue-400 opacity-40 transition-all duration-1000"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
