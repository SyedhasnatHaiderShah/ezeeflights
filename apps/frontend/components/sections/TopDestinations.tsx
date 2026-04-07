"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { AppImage } from "@/components/ui/app-image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Destination {
  id: number;
  name: string;
  image: string;
}

const DESTINATIONS: Destination[] = [
  { id: 1, name: "Los Angeles", image: "https://images.unsplash.com/photo-1534430480872-3498386e7a56?q=80&w=800&auto=format&fit=crop" },
  { id: 2, name: "Atlanta", image: "https://images.unsplash.com/photo-1575917649705-5b59aaa12e6b?q=80&w=800&auto=format&fit=crop" },
  { id: 3, name: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop" },
  { id: 4, name: "Fort Lauderdale", image: "https://images.unsplash.com/photo-1596250410216-1ac77dc208e3?q=80&w=800&auto=format&fit=crop" },
  { id: 5, name: "Washington D.C.", image: "https://images.unsplash.com/photo-1617581629397-a72507c3de9e?q=80&w=800&auto=format&fit=crop" },
  { id: 6, name: "London", image: "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?q=80&w=800&auto=format&fit=crop" },
  { id: 7, name: "Spain", image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=800&auto=format&fit=crop" },
  { id: 8, name: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop" },
]

export function TopDestinations() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { active: false } // Disable carousel on desktop
    }
  }, [Autoplay({ delay: 4000, stopOnInteraction: true })])

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const renderCard = (dest: Destination) => (
    <Link
      href={`/destinations/${dest.name.toLowerCase().replace(/\s+/g, "-")}` as any}
      key={dest.id}
      className="group flex items-center gap-4 p-3 rounded-2xl bg-card border border-border/50 hover:border-brand-red/20 hover:bg-brand-red/[0.02] hover:shadow-xl transition-all duration-500 w-full"
    >
      <div className="relative w-16 h-16 lg:w-20 lg:h-20 shrink-0 overflow-hidden rounded-xl shadow-inner">
        <AppImage
          src={dest.image}
          alt={dest.name}
          fill
          isCompact={true}
          sizes="(max-width: 768px) 64px, 80px"
          className="object-cover transition-transform duration-700 group-hover:scale-115"
        />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <h3 className="text-[15px] lg:text-lg font-bold text-foreground truncate group-hover:text-brand-red transition-colors duration-300">
          {dest.name}
        </h3>
        <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mt-0.5">
          Explore Deals
        </p>
        <div className="w-0 h-[2px] bg-brand-red mt-2 transition-all duration-500 group-hover:w-8 rounded-full" />
      </div>
    </Link>
  )

  return (
    <section className="py-12 lg:py-20 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between mb-8 lg:mb-12">
          <div className="space-y-1">
            <h2 className="text-2xl lg:text-4xl font-black tracking-tighter text-foreground">
              Top Destinations
            </h2>
            <p className="text-sm text-muted-foreground font-medium">Discover the most popular places to fly this season</p>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Navigation for Mobile Carousel */}
             <div className="flex lg:hidden items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={scrollPrev}
                  className="rounded-full w-9 h-9 border-border/50 hover:bg-brand-red hover:text-white transition-all shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={scrollNext}
                  className="rounded-full w-9 h-9 border-border/50 hover:bg-brand-red hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
             </div>

             <Link href="/destinations" className="hidden lg:block text-xs font-black text-brand-red hover:text-brand-red/80 uppercase tracking-[0.2em] transition-colors border-b-2 border-brand-red/20 pb-0.5">
              Explore All
            </Link>
          </div>
        </div>

        {/* Carousel for Mobile / Grid for Desktop */}
        <div className="relative">
          {/* Embla Viewport */}
          <div className="lg:hidden overflow-hidden" ref={emblaRef}>
            <div className="flex ml-[-16px]">
              {DESTINATIONS.map((dest) => (
                <div key={dest.id} className="flex-[0_0_85%] sm:flex-[0_0_45%] min-w-0 pl-4">
                  {renderCard(dest)}
                </div>
              ))}
            </div>
          </div>

          {/* Static Grid for Large Screens */}
          <div className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
            {DESTINATIONS.map(dest => renderCard(dest))}
          </div>
        </div>
      </div>
    </section>
  )
}
