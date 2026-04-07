"use client";

import * as React from "react";
import { ChevronsRight } from "lucide-react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { AppImage } from "@/components/ui/app-image";

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
    image:
      "https://images.unsplash.com/photo-1544016768-982d1554f0b9?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/emergency-travel",
  },
  {
    id: 2,
    title: "Travel Journey of a Student",
    description:
      "Travelling experience with Ezee flights shared by a student...",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/student-journey",
  },
  {
    id: 3,
    title: "International Family Trip",
    description:
      "Our customers shared their experience of their first international family trip...",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/family-trip",
  },
  {
    id: 4,
    title: "International Travel with Pet",
    description:
      "A customer shared her first international travel experience with her pet...",
    image:
      "https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/travel-with-pet",
  },
  {
    id: 5,
    title: "Story of Lost Baggage",
    description: "A panic story of lost baggage shared by our customer...",
    image:
      "https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/lost-baggage",
  },
  {
    id: 6,
    title: "Emergency Cancellation",
    description:
      "Emergency cancellation of tickets due to a sudden change in plans...",
    image:
      "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=1000&auto=format&fit=crop",
    link: "/experience/emergency-cancellation",
  },
];

export function TravelExperience() {
  const [emblaRef] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    breakpoints: {
      '(min-width: 1024px)': { active: false } 
    }
  }, [Autoplay({ delay: 5000, stopOnInteraction: true })]);

  const renderExperienceCard = (exp: Experience) => (
    <div
      key={exp.id}
      className="flex flex-col bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-500 group h-full w-full"
    >
      <div className="w-full h-40 relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-brand-blue/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
        <AppImage
          src={exp.image}
          alt={exp.title}
          fill
          isCompact={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="group-hover:scale-110 transition-transform duration-700 ease-out object-cover"
        />
      </div>

      <div className="p-4 flex flex-col flex-grow bg-card/50 backdrop-blur-sm">
        <h3 className="text-base font-bold text-brand-red mb-1.5 leading-tight group-hover:text-red-500 transition-colors line-clamp-1">
          {exp.title}
        </h3>
        <p className="text-muted-foreground font-medium text-xs leading-relaxed mb-4 flex-grow line-clamp-2">
          {exp.description}
        </p>

        <Link
          href={exp.link as any}
          className="inline-flex items-center gap-1 text-brand-blue dark:text-muted-foreground font-bold text-xs tracking-wider hover:opacity-80 transition-colors w-fit border border-border px-3.5 py-1.5 rounded-md hover:bg-muted group/btn shadow-sm active:scale-95 cursor-pointer"
        >
          Read Story
          <ChevronsRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );

  return (
    <section className="py-14 bg-muted/30 dark:bg-background transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">
          Travel Experiences
        </h2>

        {/* Carousel for Mobile / Grid for Desktop */}
        <div className="relative">
          {/* Embla Viewport */}
          <div className="lg:hidden overflow-hidden" ref={emblaRef}>
            <div className="flex ml-[-16px]">
              {EXPERIENCES.map((exp) => (
                <div key={exp.id} className="flex-[0_0_85%] sm:flex-[0_0_45%] min-w-0 pl-4">
                  {renderExperienceCard(exp)}
                </div>
              ))}
            </div>
          </div>

          {/* Static Grid for Large Screens */}
          <div className="hidden lg:grid grid-cols-3 gap-5 xl:gap-6">
            {EXPERIENCES.map(renderExperienceCard)}
          </div>
        </div>
      </div>
    </section>
  );
}
