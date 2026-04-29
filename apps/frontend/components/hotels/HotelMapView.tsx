"use client";

import * as React from "react";
import { MapPin, ZoomIn, ZoomOut, Layers, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { Hotel } from "@/lib/types/hotels";

interface HotelMapViewProps {
  hotels: Hotel[];
  className?: string;
}

export function HotelMapView({ hotels, className }: HotelMapViewProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full bg-slate-100 dark:bg-slate-950 overflow-hidden group",
        className,
      )}
    >
      {/* High-fidelity Mock Map Background */}
      <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/55.2708,25.2048,12,0/1200x800?access_token=pk.placeholder')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-80 dark:opacity-60" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />

      {/* Mock Clustering & Markers */}
      <div className="relative h-full w-full">
        {hotels.map((hotel, index) => {
          // Semi-random positioning for mock feel
          const top = 30 + (index * 15) % 40;
          const left = 20 + (index * 25) % 60;
          
          return (
            <div
              key={hotel.id}
              className="absolute transition-all duration-700 animate-in fade-in zoom-in slide-in-from-bottom-4"
              style={{ top: `${top}%`, left: `${left}%` }}
            >
              <div className="relative group/marker cursor-pointer">
                <div className="bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] border border-border/50 flex items-center gap-1.5 group-hover/marker:bg-brand-red group-hover/marker:text-white group-hover/marker:border-brand-red transition-all transform group-hover/marker:-translate-y-2 group-hover/marker:scale-110 duration-300">
                  <span className="text-xs font-bold whitespace-nowrap">
                    {hotel.currency} {hotel.minPricePerNight.toLocaleString()}
                  </span>
                </div>
                <div className="w-2 h-2 bg-brand-red rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2 shadow-lg group-hover/marker:scale-150 transition-transform" />
              </div>
            </div>
          );
        })}

        {/* Mock Cluster */}
        <div 
          className="absolute top-[20%] left-[60%] transition-all duration-700 animate-in fade-in zoom-in"
        >
          <div className="w-10 h-10 rounded-full bg-brand-red/20 border-2 border-brand-red flex items-center justify-center backdrop-blur-sm cursor-pointer hover:scale-125 transition-transform">
            <span className="text-xs font-black text-brand-red">12</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="p-2 bg-white rounded shadow hover:bg-slate-50 transition-colors">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button className="p-2 bg-white rounded shadow hover:bg-slate-50 transition-colors">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button className="p-2 bg-white rounded shadow hover:bg-slate-50 transition-colors">
          <Layers className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-white/20 text-xs font-bold text-slate-600 flex items-center gap-2">
        <MapPin className="w-3 h-3 text-brand-red" />
        Showing {hotels.length} hotels in the area
      </div>
    </div>
  );
}
