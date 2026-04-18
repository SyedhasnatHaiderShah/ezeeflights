"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

interface MockSearch {
  id: number;
  origin: string;
  destination: string;
  date: string;
  price?: string;
  flag: string;
}

const MOCK_SEARCHES: MockSearch[] = [
  { id: 1, origin: "JFK", destination: "DXB", date: "May 11", price: "$599", flag: "🇺🇸" },
  { id: 2, origin: "LHR", destination: "CDG", date: "May 18", price: "$121", flag: "🇬🇧" },
  { id: 3, origin: "SIN", destination: "NRT", date: "Jun 02", price: "$488", flag: "🇸🇬" },
  { id: 4, origin: "LAX", destination: "JFK", date: "Jun 21", price: "$260", flag: "🇺🇸" },
];

export function RecentSearches() {
  const [items, setItems] = React.useState(MOCK_SEARCHES);

  return (
    <section className="py-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Recent Searches</p>
        <button className="text-sm text-brand-red" type="button" onClick={() => setItems([])}>
          Clear all
        </button>
      </div>

      <div className="no-scrollbar overflow-x-auto">
        <motion.div className="flex w-max gap-2 pb-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
          <AnimatePresence>
            {items.map((search) => (
              <motion.div
                key={search.id}
                variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0 } }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-xs hover:border-brand-red/30 hover:shadow-md transition-all"
              >
                <span className="text-sm">
                  {search.flag} {search.origin}
                </span>
                <span>→</span>
                <span className="text-sm font-semibold">{search.destination}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{search.date}</span>
                {search.price ? <span className="text-sm font-semibold">· {search.price}</span> : null}
                <button
                  type="button"
                  className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setItems((prev) => prev.filter((s) => s.id !== search.id))}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
