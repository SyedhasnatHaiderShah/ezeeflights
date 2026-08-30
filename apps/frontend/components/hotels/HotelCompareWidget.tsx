"use client";

import * as React from "react";
import { X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Hotel } from "@/lib/types/hotels";

interface CompareWidgetProps {
  selectedHotels: Hotel[];
  onRemove: (hotelId: string) => void;
  onCompare: () => void;
}

export function HotelCompareWidget({
  selectedHotels,
  onRemove,
  onCompare,
}: CompareWidgetProps) {
  if (selectedHotels.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500 max-w-[95vw] w-full flex justify-center">
      <div className="bg-slate-950/90 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 flex items-center gap-8 text-white min-w-[320px] md:min-w-[450px]">
        <div className="flex -space-x-4">
          {selectedHotels.map((hotel) => (
            <div key={hotel.id} className="relative group">
              <div className="w-14 h-14 rounded-2xl border-2 border-slate-900 overflow-hidden shadow-2xl transition-transform group-hover:-translate-y-2 group-hover:scale-110 duration-300">
                {hotel.images?.[0]?.url && !hotel.images[0].url.includes("placeholder") && !hotel.images[0].url.includes("images.unsplash.com") ? (
                  <img
                    src={hotel.images[0].url}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-base">
                    🏨
                  </div>
                )}
              </div>
              <button
                onClick={() => onRemove(hotel.id)}
                className="absolute -top-2 -right-2 bg-brand-red text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-90"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {[...Array(3 - selectedHotels.length)].map((_, i) => (
            <div key={`empty-${i}`} className="w-14 h-14 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white/20">Empty</span>
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-sm font-bold leading-none tracking-tight">Compare Stays</p>
          <p className="text-[10px] text-white/40 font-semibold">
            {selectedHotels.length} of 3 properties selected
          </p>
        </div>

        <button
          onClick={onCompare}
          disabled={selectedHotels.length < 2}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all active:scale-95",
            selectedHotels.length >= 2
              ? "bg-brand-red hover:bg-brand-red/90 text-white shadow-lg shadow-brand-red/30"
              : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5",
          )}
        >
          Compare <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
