"use client";

import * as React from "react";
import { Sparkles, Info, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/app-icon";

export function SmartFilters() {
  const [aiQuery, setAiQuery] = React.useState("");

  return (
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
      <div className="p-3 space-y-3">
        {/* Smart Filters AI Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-center p-1 rounded-lg bg-brand-dark/[0.03]">
            <div className="flex items-center gap-1.5 text-brand-dark">
              <Sparkles className="w-3 h-3 fill-brand-dark" />
              <span className="text-[10px] font-black tracking-widest uppercase">
                Aero Insights
              </span>
            </div>
          </div>

          <div className="rounded-xl transition-all">
            <div className="flex items-start gap-1.5 mb-2 pl-0.5">
              <Info className="w-3 h-3 text-brand-dark/30 mt-0.5" />
              <p className="text-[9px] leading-relaxed text-brand-dark-light/40 font-bold uppercase tracking-tight">
                AI powered search.{" "}
                <button className="text-brand-dark hover:underline underline-offset-2">
                  Learn more
                </button>
              </p>
            </div>

            <div className="relative group/input">
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="I want to see flights with no layover under $300."
                className="w-full min-h-[60px] p-2.5 text-xs bg-background/30 border border-border/60 rounded-lg outline-none focus:border-brand-dark/30 focus:ring-4 focus:ring-brand-dark/5 transition-all placeholder:text-brand-dark-light/20 font-medium leading-relaxed resize-none"
              />
            </div>
          </div>
          <button
            className={cn(
              "rounded-lg w-full flex items-center cursor-pointer justify-center h-8 gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
              aiQuery.trim()
                ? "bg-brand-dark text-white hover:bg-brand-dark/90 active:scale-95"
                : "bg-muted text-brand-dark-light/20 cursor-not-allowed",
            )}
            disabled={!aiQuery.trim()}
          >
            ASK AI SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}
