"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { 
  useClearRecentSearches, 
  useDeleteRecentSearch, 
  useRecentSearches, 
  useGuestRecentSearches 
} from "@/lib/api/search";
import { useRecentSearchStore } from "@/lib/store/recent-search-store";

export function RecentSearches() {
  const session = useAuthSession();
  const isLoggedIn = Boolean(session.data);
  
  const { data: dbSearches = [], isLoading: isLoadingDb } = useRecentSearches(3, isLoggedIn);
  const { data: guestSearches = [], isLoading: isLoadingGuest } = useGuestRecentSearches();
  
  const { prefillSearch } = useRecentSearchStore();

  const isLoading = isLoggedIn ? isLoadingDb : isLoadingGuest;
  const rawData = isLoggedIn ? dbSearches : guestSearches;

  if (isLoading || rawData.length === 0) {
    return null;
  }

  const handleCardClick = (search: any) => {
    prefillSearch(search);
    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section className="py-6">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Recent Searches {isLoggedIn ? "" : "(Guest)"}
        </p>
      </div>

      <div className="no-scrollbar overflow-x-auto">
        <motion.div className="flex w-max gap-3 pb-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
          <AnimatePresence>
            {rawData.slice(0, 3).map((search: any) => (
              <motion.div 
                key={search.id} 
                variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0 } }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md transition-all hover:border-brand-red/40 hover:bg-white/10 cursor-pointer"
                onClick={() => handleCardClick(search)}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                    <span>{search.origin}</span>
                    <span className="text-white/30">→</span>
                    <span>{search.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-tighter text-white/40">
                    <span>{search.searchType}</span>
                    {search.searchDate && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        <span>{new Date(search.searchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

