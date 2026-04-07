"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface Deal {
  id: string;
  city: string;
  image: string;
  price: string;
}

const DEALS: Deal[] = [
  {
    id: "1",
    city: "Kuala Lumpur",
    image:
      "https://images.unsplash.com/photo-1534430480872-3498386e7a56?q=80&w=800&auto=format&fit=crop",
    price: "$89",
  },
  {
    id: "2",
    city: "Langkawi",
    image:
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop",
    price: "$102",
  },
  {
    id: "3",
    city: "Malacca",
    image:
      "https://images.unsplash.com/photo-1596422846543-b5c64883493b?q=80&w=800&auto=format&fit=crop",
    price: "$75",
  },
  {
    id: "4",
    city: "Penang",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop",
    price: "$93",
  },
];

import { AppImage } from "@/components/ui/app-image";

export function DealsSection() {
  return (
    <section className="py-14 bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="flex items-center justify-between mb-8 border-b border-border/60 pb-5">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground uppercase">
            Travel deals under $111
          </h2>
          <Link
            href={"/deals" as any}
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-brand-red transition-all group"
          >
            Explore more
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {DEALS.map((deal) => (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}` as any}
              className="group relative block aspect-[3.5/4.5] rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <AppImage
                src={deal.image}
                alt={deal.city}
                fill
                isCompact={true}
                className="group-hover:scale-105 transition-transform duration-700 object-cover"
              />

              {/* Overlay Metadata - Neat & Clean Glassmorphism */}
              <div className="absolute inset-x-3 bottom-3 p-3 bg-card/60 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-between shadow-lg group-hover:bg-card/80 transition-all">
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mb-0.5">
                    Starting from
                  </p>
                  <h4 className="text-[13px] font-bold text-foreground truncate leading-tight">
                    {deal.city}
                  </h4>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-[14px] font-black text-brand-red font-display">
                    {deal.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
