"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plane } from "lucide-react";

const AIRLINES = [
  { id: "emirates", name: "Emirates", price: "" },
  { id: "ethiopian", name: "Ethiopian Air", price: "" },
  { id: "etihad", name: "Etihad Airways", price: "$660" },
  { id: "flydubai", name: "flydubai", price: "" },
  { id: "pia", name: "Pakistan International Airlines", price: "" },
  { id: "multiple", name: "Multiple airlines", price: "" },
  { id: "saudia", name: "SAUDIA", price: "" },
];

export function AirlinesFilter() {
  const [selected, setSelected] = React.useState<string[]>(AIRLINES.map(a => a.id));

  const toggleAll = (select: boolean) => {
    if (select) setSelected(AIRLINES.map(a => a.id));
    else setSelected([]);
  };

  const toggleOne = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
      <div className="p-3 bg-muted/5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="w-3.5 h-3.5 text-foreground" />
          <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">Airlines</h3>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2 mb-0.5">
          <button onClick={() => toggleAll(true)} className="hover:text-brand-red transition-colors">Select all</button>
          <span className="text-border">|</span>
          <button onClick={() => toggleAll(false)} className="hover:text-brand-red transition-colors">Clear all</button>
        </div>

        <div className="space-y-2 px-0.5">
          {AIRLINES.map((airline) => (
            <div key={airline.id} className="flex items-center justify-between group cursor-pointer" onClick={() => toggleOne(airline.id)}>
              <div className="flex items-center gap-2.5">
                <Checkbox 
                  id={airline.id} 
                  checked={selected.includes(airline.id)}
                  className="w-3.5 h-3.5 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red transition-colors"
                />
                <Label 
                  htmlFor={airline.id} 
                  className="text-[11px] font-bold text-foreground/80 group-hover:text-foreground transition-colors cursor-pointer"
                >
                  {airline.name}
                </Label>
              </div>
              {airline.price && (
                <span className="text-[9px] font-black text-muted-foreground/50">
                  {airline.price}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
