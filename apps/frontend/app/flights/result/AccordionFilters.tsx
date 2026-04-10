"use client";

import * as React from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tag, Plane, Search, Star, Sofa, MapPin } from "lucide-react";

export function AccordionFilters() {
  return (
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
      <Accordion type="multiple" className="w-full">
        {/* Price */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="px-2.5 py-2 hover:no-underline [&>div]:bg-transparent [&>div]:shadow-none">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Price</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2.5 pb-2.5 pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-black text-muted-foreground/50 px-0.5">
                <span>$200</span>
                <span>$1,200+</span>
              </div>
              <Slider defaultValue={[0, 100]} max={100} step={1} className="py-1" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/40 mx-2.5" />

        {/* Layover airports */}
        <AccordionItem value="layovers" className="border-b-0">
          <AccordionTrigger className="px-2.5 py-2 hover:no-underline [&>div]:bg-transparent [&>div]:shadow-none">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Layover airports</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2.5 pb-2.5 pt-0">
            <div className="space-y-1.5 pt-0.5">
              {["Doha (DOH)", "Dubai (DXB)", "Muscat (MCT)"].map((airport) => (
                <div key={airport} className="flex items-center gap-2">
                  <Checkbox id={airport} className="w-3 h-3" />
                  <Label htmlFor={airport} className="text-[10px] font-bold opacity-70">{airport}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/40 mx-2.5" />

        {/* Cabin */}
        <AccordionItem value="cabin" className="border-b-0">
          <AccordionTrigger className="px-2.5 py-2 hover:no-underline [&>div]:bg-transparent [&>div]:shadow-none">
            <div className="flex items-center gap-1.5">
              <Sofa className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Cabin</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2.5 pb-2.5 pt-0">
            <div className="space-y-1.5 pt-0.5">
              {["Economy", "Premium Economy", "Business", "First Class"].map((cabin) => (
                <div key={cabin} className="flex items-center gap-2">
                  <Checkbox id={cabin} className="w-3 h-3" />
                  <Label htmlFor={cabin} className="text-[10px] font-bold opacity-70">{cabin}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/40 mx-2.5" />

        {/* Flight quality */}
        <AccordionItem value="quality" className="border-b-0">
          <AccordionTrigger className="px-2.5 py-2 hover:no-underline [&>div]:bg-transparent [&>div]:shadow-none">
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Flight quality</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2.5 pb-2.5 pt-0">
            <div className="space-y-1.5 pt-0.5">
              {["Show Wi-Fi", "Show Power", "Short layovers"].map((quality) => (
                <div key={quality} className="flex items-center gap-2">
                  <Checkbox id={quality} className="w-3 h-3" />
                  <Label htmlFor={quality} className="text-[10px] font-bold opacity-70">{quality}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/40 mx-2.5" />

        {/* Aircraft */}
        <AccordionItem value="aircraft" className="border-b-0">
          <AccordionTrigger className="px-2.5 py-2 hover:no-underline [&>div]:bg-transparent [&>div]:shadow-none">
            <div className="flex items-center gap-1.5">
              <Plane className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Aircraft</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2.5 pb-2.5 pt-0">
            <div className="space-y-1.5 pt-0.5">
              {["Boeing 777", "Airbus A380", "Dreamliner 787"].map((plane) => (
                <div key={plane} className="flex items-center gap-2">
                  <Checkbox id={plane} className="w-3 h-3" />
                  <Label htmlFor={plane} className="text-[10px] font-bold opacity-70">{plane}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
