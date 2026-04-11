"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Globe, MapPin, Bus } from "lucide-react";

export function LocationFilters() {
  return (
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden divide-y divide-border/30">
      {/* Alliance */}
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2 mb-0.5">
          <Globe className="w-3 h-3 text-brand-dark/40" />
          <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Alliance</h3>
        </div>
        <div className="flex items-center gap-2.5 px-0.5">
          <Checkbox id="skyteam" className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
          <Label htmlFor="skyteam" className="text-xs font-bold text-brand-dark-light/60">SkyTeam</Label>
        </div>
      </div>

      {/* Airports */}
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2 mb-0.5">
          <MapPin className="w-3 h-3 text-brand-dark/40" />
          <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Airports</h3>
        </div>
        
        <div className="space-y-3 px-0.5">
          <div className="flex items-center gap-2.5">
             <Checkbox id="same-airport" className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
             <Label htmlFor="same-airport" className="text-xs font-bold text-brand-dark-light/60">Depart/return same</Label>
          </div>
          
          <div className="space-y-2 pt-1.5 border-t border-border/20">
            <p className="text-[9px] font-black text-brand-dark-light/30 uppercase tracking-widest">Lahore</p>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2.5">
                 <Checkbox id="lhe" className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
                 <Label htmlFor="lhe" className="text-xs font-semibold text-brand-dark-light/80">LHE: Lahore</Label>
               </div>
               <span className="text-[9px] font-black text-brand-dark-light/30">$660</span>
            </div>
          </div>

          <div className="space-y-2 pt-1.5 border-t border-border/20">
            <p className="text-[9px] font-black text-brand-dark-light/30 uppercase tracking-widest">Abu Dhabi</p>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Checkbox id="auh" className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
                        <Label htmlFor="auh" className="text-xs font-semibold text-brand-dark-light/80">AUH: Zayed Intl</Label>
                    </div>
                    <span className="text-[9px] font-black text-brand-dark-light/30">$660</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <Checkbox id="auh-ek" className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
                    <Label htmlFor="auh-ek" className="text-xs font-semibold text-brand-dark-light/80">Abu Dhabi Ek</Label>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transportation options */}
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2 mb-0.5">
          <Bus className="w-3 h-3 text-brand-dark/40" />
          <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Transportation</h3>
        </div>
        <div className="space-y-2.5 px-0.5">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2.5">
                 <Checkbox id="trans-flights" defaultChecked className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
                 <Label htmlFor="trans-flights" className="text-xs font-semibold text-brand-dark-light/80">Flights</Label>
               </div>
               <span className="text-[9px] font-black text-brand-dark-light/30">$660</span>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2.5">
                 <Checkbox id="trans-bus" className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
                 <Label htmlFor="trans-bus" className="text-xs font-semibold text-brand-dark-light/80">Flights + buses</Label>
               </div>
               <span className="text-[9px] font-black text-brand-dark-light/30">$778</span>
            </div>
        </div>
      </div>
    </div>
  );
}
