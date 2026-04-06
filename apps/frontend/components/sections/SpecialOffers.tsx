"use client"

import * as React from "react"
import { ChevronsRight, Ticket, Headset, CircleDollarSign, LucideIcon } from "lucide-react"
import { AppImage } from "@/components/ui/app-image"

interface InfoCard {
  id: number;
  icon: LucideIcon;
  title: string;
  text: React.ReactNode;
}

const INFO_CARDS: InfoCard[] = [
  {
    id: 1,
    icon: Ticket,
    title: "We are now available",
    text: (
      <span>
        Call <span className="text-brand-red font-bold">+1-888-604-0198</span> for contact with us
      </span>
    ),
  },
  {
    id: 2,
    icon: Headset,
    title: "Call Now for Exclusive Fare Deals",
    text: (
      <span>
        Call <span className="text-brand-red font-bold">+1-888-604-0198</span> for contact with us
      </span>
    ),
  },
  {
    id: 3,
    icon: CircleDollarSign,
    title: "Check Refund",
    text: (
      <span>
        Call <span className="text-brand-red font-bold">+1-888-604-0198</span> for contact with us
      </span>
    ),
  },
]

interface Offer {
  id: number;
  title: string;
  description: string;
  image: string;
}

const OFFERS: Offer[] = [
  {
    id: 1,
    title: "International Flight Offers",
    description: "Fly Global, Save Big: Your Gateway to Affordable Adventures Internationally",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Domestic Flight Offers",
    description: "Sky-High Savings: Your Ticket to Affordable Domestic Flights!",
    image: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Earn Discounts",
    description: "Ezee Flights: Where Earning Discounts is a Breeze!",
    image: "https://images.unsplash.com/photo-1627843563095-f6e94676cfe0?q=80&w=1000&auto=format&fit=crop",
  }
]

export function SpecialOffers() {
  return (
    <section className="py-16 bg-muted/30 dark:bg-background transition-colors duration-300 relative overflow-hidden">
      {/* Information Contact Cards - More Compact Row */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INFO_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 shrink-0 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                <card.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-foreground font-display leading-tight">
                  {card.title}
                </h4>
                <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                  {card.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Header Banner - Sleeker Height */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-10">
        <div className="w-full bg-gradient-to-r from-brand-blue via-blue-900 to-brand-blue py-5 rounded-xl shadow-lg border border-blue-800/30 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
          <h2 className="relative z-10 text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
            Special Flight Offers
          </h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
            >
              {/* Image Container - More Editorial Ratio */}
              <div className="w-full h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <AppImage
                  src={offer.image}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="group-hover:scale-105 transition-transform duration-700 object-cover"
                />
              </div>

              {/* Content - Compact Typography */}
              <div className="p-6 flex flex-col flex-grow bg-card/40 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-brand-red mb-2 font-display">
                  {offer.title}
                </h3>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-6 flex-grow line-clamp-2">
                  {offer.description}
                </p>

                <button className="flex items-center gap-1.5 text-brand-blue dark:text-brand-red-light font-bold text-sm hover:opacity-80 transition-colors w-fit border border-border px-5 py-2 rounded-md hover:bg-muted group/btn shadow-sm active:scale-95">
                  View Offer
                  <ChevronsRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
