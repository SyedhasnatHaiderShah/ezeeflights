"use client";

import * as React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import {
  useClearRecentSearches,
  useDeleteRecentSearch,
  useRecentSearches,
  useGuestRecentSearches,
} from "@/lib/api/search";
import { useRecentSearchStore } from "@/lib/store/recent-search-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History, Search, ArrowRight, Clock } from "lucide-react";

export function RecentSearches() {
  const [open, setOpen] = useState(false);
  const session = useAuthSession();
  const isLoggedIn = Boolean(session.data);

  const { data: dbSearches = [], isLoading: isLoadingDb } = useRecentSearches(
    10, // Increased to show more in dialog
    isLoggedIn,
  );
  const { data: guestSearches = [], isLoading: isLoadingGuest } =
    useGuestRecentSearches();

  const { prefillSearch } = useRecentSearchStore();

  const isLoading = isLoggedIn ? isLoadingDb : isLoadingGuest;
  const rawData = isLoggedIn ? dbSearches : guestSearches;

  if (isLoading || rawData.length === 0) {
    return null;
  }

  const handleCardClick = (search: any) => {
    prefillSearch(search);
    setOpen(false);
    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section className="py-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 backdrop-blur-md transition-all hover:border-brand-red/40 hover:bg-white/10">
            <History className="h-3.5 w-3.5 text-brand-red" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/70 group-hover:text-white">
              Show Recent Searches {isLoggedIn ? "" : "(Guest)"}
            </span>
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl border-white/10 bg-black/80 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-white">
              <Clock className="h-5 w-5 text-brand-red" />
              Recent Searches
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {rawData.map((search: any) => (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-brand-red/30 hover:bg-white/[0.06] cursor-pointer"
                  onClick={() => handleCardClick(search)}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                          <Search className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                          {search.searchType}
                        </span>
                      </div>
                      {search.searchDate && (
                        <span className="text-[10px] font-medium text-white/30">
                          {new Date(search.searchDate).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          {search.origin}
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-white/20" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          {search.destination}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Gradient Effect */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-red/0 via-brand-red/0 to-brand-red/5 opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
