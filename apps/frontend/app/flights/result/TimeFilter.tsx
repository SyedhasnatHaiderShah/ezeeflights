"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

export function TimeFilter() {
  const [takeoffRange, setTakeoffRange] = React.useState([15, 60]); // 3:30 PM to 8:00 PM approx
  const [landingRange, setLandingRange] = React.useState([20, 80]);

  return (
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
      <div className="p-3 bg-brand-dark/[0.02] border-b border-border/50 flex items-center gap-2">
        <Clock className="w-3 h-3 text-brand-dark/40" />
        <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Times</h3>
      </div>
      <div className="p-3">
        <Tabs defaultValue="take-off" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-8 bg-muted/20 p-0.5 rounded-lg">
            <TabsTrigger value="take-off" className="text-[9px] font-black uppercase tracking-widest h-7 data-[state=active]:bg-white data-[state=active]:text-brand-dark data-[state=active]:shadow-sm transition-all">Take-off</TabsTrigger>
            <TabsTrigger value="landing" className="text-[9px] font-black uppercase tracking-widest h-7 data-[state=active]:bg-white data-[state=active]:text-brand-dark data-[state=active]:shadow-sm transition-all">Landing</TabsTrigger>
          </TabsList>

          <TabsContent value="take-off" className="space-y-4 outline-none">
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-brand-dark-light/40 uppercase tracking-widest">Take-off from LHE</span>
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-xs font-bold text-brand-dark leading-none">3:30 PM</span>
                  <span className="text-xs font-bold text-brand-dark leading-none">8:00 PM</span>
                </div>
              </div>
              <Slider 
                defaultValue={[15, 60]} 
                max={100} 
                step={1} 
                onValueChange={setTakeoffRange}
                className="py-1"
              />
            </div>

            <div className="h-px bg-border/40 my-3" />

            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-brand-dark-light/40 uppercase tracking-widest">Take-off from AUH</span>
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-xs font-bold text-brand-dark leading-none">2:00 AM</span>
                  <span className="text-xs font-bold text-brand-dark leading-none">12:00 AM</span>
                </div>
              </div>
              <Slider 
                defaultValue={[20, 80]} 
                max={100} 
                step={1} 
                className="py-1"
              />
            </div>
          </TabsContent>

          <TabsContent value="landing" className="space-y-4 outline-none">
            <div className="w-full space-y-2">
               <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-brand-dark-light/40 uppercase tracking-widest">LHE Arrival</span>
                  <span className="text-xs font-bold text-brand-dark leading-none">10:00 AM - 11:59 PM</span>
               </div>
               <Slider defaultValue={[10, 90]} max={100} step={1} className="py-1" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
