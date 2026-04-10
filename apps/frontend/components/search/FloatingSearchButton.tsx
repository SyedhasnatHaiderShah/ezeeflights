"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function FloatingSearchButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    // Trigger highlight event for the search form
    window.dispatchEvent(new CustomEvent("ezee-highlight-search"));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-24 right-6 md:right-10 z-[60]"
        >
          <button
            onClick={scrollToTop}
            className={cn(
              "group relative flex items-center gap-3 px-5 py-3.5 rounded-full",
              "bg-redmix text-white shadow-lg shadow-redmix/30 active:scale-95 transition-all",
              "hover:shadow-xl hover:shadow-redmix/40 hover:-translate-y-1"
            )}
            aria-label="Modify Search"
          >
            <div className="relative">
              <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full blur-md"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="font-bold text-sm tracking-wide hidden md:block">
              Modify Search
            </span>
            
            {/* Subtle gloss effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
