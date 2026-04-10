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
      <div className="p-3 bg-muted/5 border-b border-border/50 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-foreground" />
        <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">Times</h3>
      </div>
      <div className="p-3">
        <Tabs defaultValue="take-off" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-8">
            <TabsTrigger value="take-off" className="text-[10px] font-bold h-7">Take-off</TabsTrigger>
            <TabsTrigger value="landing" className="text-[10px] font-bold h-7">Landing</TabsTrigger>
          </TabsList>

          <TabsContent value="take-off" className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-foreground uppercase">Take-off from LHE</span>
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground/70">Fri 3:30 PM</span>
                  <span className="text-[10px] font-bold text-muted-foreground/70">8:00 PM</span>
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

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-foreground uppercase">Take-off from AUH</span>
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground/70">Mon 2:00 AM</span>
                  <span className="text-[10px] font-bold text-muted-foreground/70">Tue 12:00 AM</span>
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

          <TabsContent value="landing" className="space-y-4">
            <div className="w-full space-y-3">
               <div className="flex justify-between items-center px-0.5">
                  <span className="text-[10px] font-black uppercase">LHE Arrival</span>
                  <span className="text-[10px] font-bold text-muted-foreground/70">10:00 AM - 11:59 PM</span>
               </div>
               <Slider defaultValue={[10, 90]} max={100} step={1} className="py-1" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
