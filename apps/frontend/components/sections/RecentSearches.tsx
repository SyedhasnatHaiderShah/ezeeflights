"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useClearRecentSearches, useDeleteRecentSearch, useRecentSearches } from "@/lib/api/search";

export function RecentSearches() {
  const session = useAuthSession();
  const { data = [] } = useRecentSearches(8, Boolean(session.data));
  const deleteMutation = useDeleteRecentSearch();
  const clearMutation = useClearRecentSearches();

  if (!session.data) {
    return (
      <section className="py-8">
        <div className="mb-4 flex items-center justify-between"><p className="text-sm font-medium text-muted-foreground">Recent Searches</p></div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Recent Searches</p>
        <button className="text-sm text-brand-red" type="button" onClick={() => clearMutation.mutate()}>
          Clear all
        </button>
      </div>

      <div className="no-scrollbar overflow-x-auto">
        <motion.div className="flex w-max gap-2 pb-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
          <AnimatePresence>
            {data.map((search) => (
              <motion.div key={search.id} variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0 } }} exit={{ opacity: 0, scale: 0.9 }} className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-xs transition-all hover:border-brand-red/30 hover:shadow-md">
                <span className="text-sm">{search.flag || "🌍"} {search.origin}</span>
                <span>→</span>
                <span className="text-sm font-semibold">{search.destination}</span>
                {search.date ? <><span className="text-muted-foreground">·</span><span className="text-sm text-muted-foreground">{search.date}</span></> : null}
                {search.price ? <span className="text-sm font-semibold">· {search.price}</span> : null}
                <button type="button" className="ml-1 opacity-0 transition-opacity group-hover:opacity-100" onClick={() => deleteMutation.mutate(search.id)}>×</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
