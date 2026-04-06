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
    <section id="destinations" className="py-16 bg-muted/30 dark:bg-background relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div className="space-y-1">
            <span className="text-brand-red font-semibold tracking-widest capitalize text-[10px]">Exclusive Collections</span>
            <h2 className="font-display font-bold text-3xl tracking-tight text-foreground leading-tight">
              Curated Journeys
            </h2>
          </div>
          <button className="flex items-center space-x-1.5 text-brand-red font-bold hover:text-brand-blue dark:hover:text-brand-red-light transition-colors group">
            <span className="text-[11px] capitalize tracking-widest">Explore All</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {JOURNEYS.map((dest, i) => (
            <div
              key={i}
              className="group flex flex-col bg-card border border-border hover:border-brand-red/20 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Image Container - More Compact */}
              <div className="h-44 md:h-48 relative border-b border-border overflow-hidden">
                <AppImage
                  src={dest.img}
                  alt={dest.city}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="group-hover:scale-105 transition-transform duration-700 ease-out object-cover"
                />

                {/* Compact Dynamic Status Tag */}
                <div className="absolute top-3 right-3 z-20">
                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-widest capitalize ${dest.tagColor.replace("bg-", "dark:bg-opacity-20 bg-").replace("text-", "dark:text-")} border border-white/20 backdrop-blur-md`}>
                    {dest.tag}
                  </span>
                </div>
              </div>

              {/* Card Content Segment - Refined Padding */}
              <div className="p-5 md:p-6 flex flex-col flex-grow transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-0.5">
                    <h3 className="font-display font-bold text-lg text-foreground tracking-tight group-hover:text-brand-red transition-colors">
                      {dest.city}
                    </h3>
                    <p className="text-muted-foreground font-medium text-[11px] capitalize">{dest.desc}</p>
                  </div>
                  <div className="flex text-redmix drop-shadow-sm scale-75 origin-right">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground font-medium text-[9px] capitalize tracking-widest mb-0.5">From</span>
                    <span className="font-bold text-base text-brand-red font-display leading-none">{dest.price}</span>
                  </div>

                  {/* Decorative Action Button - Scaled down */}
                  <div className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-all shadow-sm">
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
