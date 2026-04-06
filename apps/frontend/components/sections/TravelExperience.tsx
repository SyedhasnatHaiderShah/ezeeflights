"use client"

import * as React from "react"
import { ChevronsRight } from "lucide-react"
import Link from "next/link"
import { AppImage } from "@/components/ui/app-image"

interface Experience {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

const EXPERIENCES: Experience[] = [
  {
    id: 1,
    title: "Emergency Travel Story",
    description: "An emergency travel story shared by our customer...",
    image: "https://images.unsplash.com/photo-1544016768-982d1554f0b9?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/emergency-travel"
  },
  {
    id: 2,
    title: "Travel Journey of a Student",
    description: "Travelling experience with Ezee flights shared by a student...",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/student-journey"
  },
  {
    id: 3,
    title: "International Family Trip",
    description: "Our customers shared their experience of their first international family trip...",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/family-trip"
  },
  {
    id: 4,
    title: "International Travel with Pet",
    description: "A customer shared her first international travel experience with her pet...",
    image: "https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/travel-with-pet"
  },
  {
    id: 5,
    title: "Story of Lost Baggage",
    description: "A panic story of lost baggage shared by our customer...",
    image: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/lost-baggage"
  },
  {
    id: 6,
    title: "Emergency Cancellation",
    description: "Emergency cancellation of tickets due to a sudden change in plans...",
    image: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/emergency-cancellation"
  }
]

export function TravelExperience() {
  return (
    <section className="py-16 bg-muted/30 dark:bg-background transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-3xl font-bold text-foreground font-display mb-10 tracking-tight">
          Travel Experiences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {EXPERIENCES.map((exp) => (
            <div
              key={exp.id}
              className="flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
            >
              <div className="w-full h-48 relative border-b border-border overflow-hidden">
                <div className="absolute inset-0 bg-brand-blue/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
                <AppImage
                  src={exp.image}
                  alt={exp.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="group-hover:scale-105 transition-transform duration-700 ease-out object-cover"
                />
              </div>

              {/* Content - Compact & Refined */}
              <div className="p-6 flex flex-col flex-grow bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-brand-red mb-2 font-display leading-tight group-hover:text-red-500 transition-colors line-clamp-1">
                  {exp.title}
                </h3>
                <p className="text-muted-foreground font-medium text-xs leading-relaxed mb-6 flex-grow line-clamp-2">
                  {exp.description}
                </p>

                <Link
                  href={exp.link as any}
                  className="inline-flex items-center gap-1.5 text-brand-blue dark:text-brand-red-light font-bold text-xs hover:opacity-80 transition-colors w-fit border border-border px-4 py-2 rounded-md hover:bg-muted group/btn shadow-sm active:scale-95"
                >
                  Read Story
                  <ChevronsRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
