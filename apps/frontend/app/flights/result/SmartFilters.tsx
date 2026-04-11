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
          <div className="flex items-center justify-center p-1 rounded-md bg-brand-dark/[0.03]">
            <div className="flex items-center gap-1.5 text-brand-dark">
              <Sparkles className="w-3 h-3 fill-brand-dark" />
              <span className="text-lg font-font">Aero Insights</span>
            </div>
          </div>

          <div className="rounded-xl transition-all">
            <div className="flex items-start gap-1.5 mb-2 pl-0.5">
              <Info className="w-4 h-4 text-brand-yellow mt-0.5" />
              <p className="text-sm text-brand-dark-light/80 font-bold ">
                AI powered search.{" "}
                <button className="text-brand-redmix cursor-pointer text-xs hover:underline underline-offset-2">
                  Learn more
                </button>
              </p>
            </div>

            <div className="relative group/input">
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="I want to see flights with no layover under $300."
                className="w-full min-h-[60px] p-2.5 text-xs bg-background/30 border border-border/60 rounded-lg outline-none focus:border-brand-dark/30 focus:ring-4 focus:ring-brand-dark/5 transition-all placeholder:text-brand-dark-light/80 font-medium leading-relaxed resize-none placeholder:text-xs"
              />
            </div>
          </div>
          <button
            className={cn(
              "rounded-md py-2 w-full flex items-center cursor-pointer justify-center h-8 gap-2 text-xs font-bold transition-all shadow-sm",
              aiQuery.trim()
                ? "bg-white text-ezee-red hover:bg-brand-dark/90"
                : "bg-white text-redmix cursor-not-allowed",
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
