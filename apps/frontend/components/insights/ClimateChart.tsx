"use client";

import { CloudRain, Sun, Users, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClimateChart({ climate }: { climate: any[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 border-b border-border pb-3">
        <h3 className="text-base font-bold text-foreground">Climate & Seasonal Guide</h3>
      </div>

      <div className="flex items-end justify-between gap-1.5 h-36 mb-6">
        {climate.map((data) => (
          <div key={data.month} className="flex flex-col items-center flex-1 gap-2">
            <div className="relative w-full flex flex-col items-center justify-end gap-0.5 group">
               {/* Temp Bar */}
               <div 
                style={{ height: `${(data.temp / 45) * 100}%` }}
                className="w-full max-w-[20px] rounded-t-md bg-orange-400/80 transition-all group-hover:bg-redmix"
               />
               {/* Rain Bar */}
               <div 
                style={{ height: `${(data.rainfall / 50) * 100}%` }}
                className="w-full max-w-[20px] rounded-t-md bg-blue-400 opacity-20 absolute bottom-0"
               />
               <span className="absolute -top-5 text-[8px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {data.temp}°C
               </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{data.month}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded bg-orange-400/80" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Temp</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded bg-blue-400 opacity-20" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Rain</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Crowd</span>
        </div>
      </div>
    </div>
  );
}

export function AIComparisonTool({ comparison }: { comparison: any }) {
  const dests = Object.keys(comparison.scores);
  
  return (
    <section className="space-y-6 rounded-2xl bg-card p-5 text-foreground shadow-sm border border-border">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-redmix">
            <Sparkles className="h-3.5 w-3.5" />
            AI Trip Decision Support
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Compare <span className="text-redmix">Destinations</span></h2>
          <p className="text-muted-foreground text-xs font-medium max-w-md">Let our AI analyze 10 key parameters to help you choose your next journey.</p>
        </div>
        
        <div className="flex gap-2">
          {dests.map(d => (
            <div key={d} className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-1.5 border border-border">
              <div className={cn("h-2.5 w-2.5 rounded-full", d === "Dubai" ? "bg-redmix" : "bg-blue-400")} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3.5">
        {comparison.params.map((param: string, i: number) => {
          const score1 = comparison.scores[dests[0]][i];
          const score2 = comparison.scores[dests[1]][i];
          const winner = score1 > score2 ? dests[0] : dests[1];

          return (
            <div key={param} className="group relative flex flex-col gap-2 rounded-xl bg-muted/20 p-4 border border-border/40 transition-all hover:bg-muted/45">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{param}</p>
                <div className="flex items-center gap-1.5">
                  <Trophy className={cn("h-3 w-3", winner === "Dubai" ? "text-redmix" : "text-blue-400")} />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Favorite: {winner}</span>
                </div>
              </div>

              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted-foreground/10">
                <div
                  style={{ width: `${score1 * 10}%` }}
                  className="absolute left-0 top-0 h-full bg-redmix transition-all duration-1000"
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
