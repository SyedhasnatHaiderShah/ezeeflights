"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"

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
    image: "https://images.unsplash.com/photo-1514467317378-430ecdf08619?auto=format&fit=crop&q=80",
    price: "$89"
  },
  {
    id: "2",
    city: "Langkawi",
    image: "https://images.unsplash.com/photo-1544985367-75e1f0e49ca0?auto=format&fit=crop&q=80",
    price: "$102"
  },
  {
    id: "3",
    city: "Malacca",
    image: "https://images.unsplash.com/photo-1596422846543-b5c64883493b?auto=format&fit=crop&q=80",
    price: "$75"
  },
  {
    id: "4",
    city: "Penang",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80",
    price: "$93"
  },
]

export function DealsSection() {
  return (
    <section className="py-24 bg-background transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground dark:text-brand-red-light">Travel deals under $111</h2>
          <Link href={"/deals" as any} className="flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-brand-red transition-colors group">
            Explore more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEALS.map((deal) => (
            <Link key={deal.id} href={`/deals/${deal.id}` as any} className="group space-y-4">
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-muted">
                <Image
                  src={deal.image}
                  alt={deal.city}
                  fill
                  className="object-cover transition-transform group-hover:scale-110 duration-700"
                />
              </div>
              <p className="text-lg font-bold text-foreground group-hover:text-brand-red transition-colors">{deal.city}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
