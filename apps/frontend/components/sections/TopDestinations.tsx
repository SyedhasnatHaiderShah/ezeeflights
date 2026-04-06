"use client"

import * as React from "react"
import Link from "next/link"
import { AppImage } from "@/components/ui/app-image"

interface Destination {
  id: number;
  name: string;
  image: string;
}

const DESTINATIONS: Destination[] = [
  { id: 1, name: "Los Angeles", image: "https://images.unsplash.com/photo-1542736667-069246bdf6d7?q=80&w=800&auto=format&fit=crop" },
  { id: 2, name: "Atlanta", image: "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?q=80&w=800&auto=format&fit=crop" },
  { id: 3, name: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop" },
  { id: 4, name: "Fort Lauderdale", image: "https://images.unsplash.com/photo-1596250410216-1ac77dc208e3?q=80&w=800&auto=format&fit=crop" },
  { id: 5, name: "Washington D.C.", image: "https://images.unsplash.com/photo-1617581629397-a72507c3de9e?q=80&w=800&auto=format&fit=crop" },
  { id: 6, name: "London", image: "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?q=80&w=800&auto=format&fit=crop" },
  { id: 7, name: "Spain", image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=800&auto=format&fit=crop" },
  { id: 8, name: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop" },
]

export function TopDestinations() {
  return (
    <section className="py-16 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-3xl font-bold text-foreground font-display mb-10 tracking-tight">
          Top Flight Destinations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {DESTINATIONS.map((dest) => (
            <Link
              href={`/destinations/${dest.name.toLowerCase().replace(/\s+/g, "-")}` as any}
              key={dest.id}
              className="group relative h-[220px] sm:h-[240px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 block border border-border/40"
            >
              <AppImage
                src={dest.image}
                alt={`${dest.name} Flight Destination`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="group-hover:scale-105 transition-all duration-700 ease-out object-cover"
              />

              {/* Sleeker Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

              {/* Compact Arrow Element */}
              <div className="absolute top-3 right-3 w-8 h-8 border border-white/20 rounded-md flex items-center justify-center backdrop-blur-md bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>

              {/* Text - Left Aligned and Compact */}
              <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col items-start justify-end transform">
                <h3 className="text-white text-lg font-bold font-display tracking-tight drop-shadow-md">
                  {dest.name}
                </h3>
                {/* Minimal bar */}
                <div className="w-0 h-[2px] bg-brand-red mt-1.5 transition-all duration-500 group-hover:w-8 rounded-full" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
