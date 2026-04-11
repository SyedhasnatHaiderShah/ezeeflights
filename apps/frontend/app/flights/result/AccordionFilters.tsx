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
          <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&>div]:bg-transparent [&>div]:shadow-none">
            <div className="flex items-center gap-2">
              <Tag className="w-3 h-3 text-brand-dark/40" />
              <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Price</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-black text-brand-dark-light/30 px-0.5 uppercase tracking-widest">
                <span>$200</span>
                <span>$1,200+</span>
              </div>
              <Slider defaultValue={[0, 100]} max={100} step={1} className="py-1" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 mx-3" />

        {/* Layover airports */}
        <AccordionItem value="layovers" className="border-b-0">
          <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&>div]:bg-transparent [&>div]:shadow-none">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-brand-dark/40" />
              <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Layover airports</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 pt-0">
            <div className="space-y-2 pt-0.5">
              {["Doha (DOH)", "Dubai (DXB)", "Muscat (MCT)"].map((airport) => (
                <div key={airport} className="flex items-center gap-2.5">
                  <Checkbox id={airport} className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
                  <Label htmlFor={airport} className="text-xs font-bold text-brand-dark-light/60 cursor-pointer">{airport}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 mx-3" />

        {/* Cabin */}
        <AccordionItem value="cabin" className="border-b-0">
          <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&>div]:bg-transparent [&>div]:shadow-none">
            <div className="flex items-center gap-2">
              <Sofa className="w-3 h-3 text-brand-dark/40" />
              <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Cabin</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 pt-0">
            <div className="space-y-2 pt-0.5">
              {["Economy", "Premium Economy", "Business", "First Class"].map((cabin) => (
                <div key={cabin} className="flex items-center gap-2.5">
                  <Checkbox id={cabin} className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
                  <Label htmlFor={cabin} className="text-xs font-bold text-brand-dark-light/60 cursor-pointer">{cabin}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 mx-3" />

        {/* Flight quality */}
        <AccordionItem value="quality" className="border-b-0">
          <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&>div]:bg-transparent [&>div]:shadow-none">
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3 text-brand-dark/40" />
              <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Flight quality</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 pt-0">
            <div className="space-y-2 pt-0.5">
              {["Show Wi-Fi", "Show Power", "Short layovers"].map((quality) => (
                <div key={quality} className="flex items-center gap-2.5">
                  <Checkbox id={quality} className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
                  <Label htmlFor={quality} className="text-xs font-bold text-brand-dark-light/60 cursor-pointer">{quality}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 mx-3" />

        {/* Aircraft */}
        <AccordionItem value="aircraft" className="border-b-0">
          <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&>div]:bg-transparent [&>div]:shadow-none">
            <div className="flex items-center gap-2">
              <Plane className="w-3 h-3 text-brand-dark/40" />
              <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest">Aircraft</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 pt-0">
            <div className="space-y-2 pt-0.5">
              {["Boeing 777", "Airbus A380", "Dreamliner 787"].map((plane) => (
                <div key={plane} className="flex items-center gap-2.5">
                  <Checkbox id={plane} className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark" />
                  <Label htmlFor={plane} className="text-xs font-bold text-brand-dark-light/60 cursor-pointer">{plane}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
