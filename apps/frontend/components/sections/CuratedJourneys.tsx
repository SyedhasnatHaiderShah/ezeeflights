"use client"

import * as React from "react"
import { ArrowRight, Star } from "lucide-react"
import { AppImage } from "@/components/ui/app-image"

interface Journey {
  city: string;
  desc: string;
  price: string;
  img: string;
  tag: string;
  tagColor: string;
}

const JOURNEYS: Journey[] = [
  {
    city: "London",
    desc: "The Royal Standard",
    price: "$1,250",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1070&auto=format&fit=crop",
    tag: "LIMITED",
    tagColor: "bg-red-50 text-red-600 border-red-200"
  },
  {
    city: "Dubai",
    desc: "Mirage in the Sands",
    price: "$2,400",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1070&auto=format&fit=crop",
    tag: "POPULAR",
    tagColor: "bg-blue-50 text-blue-600 border-blue-200"
  },
  {
    city: "Tokyo",
    desc: "Precision Culture",
    price: "$3,100",
    img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1070&auto=format&fit=crop",
    tag: "CURATED",
    tagColor: "bg-amber-50 text-amber-600 border-amber-200"
  },
]

export function CuratedJourneys() {
  return (
    <section id="destinations" className="py-14 bg-muted/30 dark:bg-background relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-baseline justify-between mb-8 px-1">
          <div className="space-y-0.5">
            <span className="text-brand-red font-bold uppercase tracking-[0.2em] text-[9px] block">Exclusive Collections</span>
            <h2 className="font-bold text-2xl tracking-tight text-foreground leading-tight">
              Curated Journeys
            </h2>
          </div>
          <button className="flex items-center space-x-1 text-brand-red font-bold hover:text-brand-blue dark:hover:text-brand-red-light transition-all active:scale-95 group">
            <span className="text-[10px] uppercase tracking-wider">Explore All</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {JOURNEYS.map((dest, i) => (
            <div
              key={i}
              className="group flex flex-row items-center gap-4 bg-card border border-border/60 hover:border-brand-red/20 rounded-xl p-3 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Square Image Thumbnail */}
              <div className="relative w-28 h-28 shrink-0 overflow-hidden rounded-lg">
                <AppImage
                  src={dest.img}
                  alt={dest.city}
                  fill
                  isCompact={true}
                  sizes="112px"
                  className="group-hover:scale-105 transition-transform duration-500 ease-out object-cover"
                />
                
                {/* Status Tag - Repositioned for Compactness */}
                <div className="absolute top-1.5 right-1.5 z-20">
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm tracking-widest uppercase ${dest.tagColor.replace("bg-", "dark:bg-opacity-20 bg-").replace("text-", "dark:text-")} border border-white/10 backdrop-blur-md`}>
                    {dest.tag}
                  </span>
                </div>
              </div>

              {/* Refined Content Area */}
              <div className="flex flex-col flex-grow min-w-0 pr-1">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex text-brand-red scale-75 origin-left -ml-1">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>

                <h3 className="font-bold text-[15px] text-foreground tracking-tight truncate group-hover:text-brand-red transition-colors">
                  {dest.city}
                </h3>
                <p className="text-muted-foreground font-medium text-[11px] truncate mb-3">{dest.desc}</p>

                <div className="flex justify-between items-end mt-auto">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground font-bold text-[8px] uppercase tracking-wider -mb-0.5">From</span>
                    <span className="font-bold text-[15px] text-brand-red leading-none">{dest.price}</span>
                  </div>

                  <div className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-all shadow-sm">
                    <ArrowRight className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
