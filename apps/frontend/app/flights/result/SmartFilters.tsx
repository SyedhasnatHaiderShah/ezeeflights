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
          <div className="flex items-center justify-center p-1 rounded-lg bg-redmix/5">
            <div className="flex items-center gap-1.5 text-redmix">
              <Sparkles className="w-3.5 h-3.5 fill-redmix" />
              <span className="text-[11px] font-bold tracking-tight uppercase">
                Smart Filters
              </span>
            </div>
          </div>

          <div className="rounded-xl cursor-not-allowed transition-all opacity-90">
            <div className="flex items-start gap-1.5 mb-2 pl-1">
              <Info className="w-3 h-3 text-brand-red/60 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-muted-foreground font-medium">
                AI-powered; AI can make mistakes.{" "}
                <button className="text-brand-red hover:underline decoration-brand-red/30 underline-offset-2">
                  Learn more
                </button>
              </p>
            </div>

            <div className="relative group/input">
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="I want to see flights with no layover under $300."
                className="w-full min-h-[70px] p-2.5 text-[11px] bg-background/30 border border-border/60 rounded-lg outline-none focus:border-brand-red/30 focus:ring-2 focus:ring-brand-red/5 transition-all placeholder:text-muted-foreground/50 resize-none font-medium leading-relaxed"
              />
              {/* Aesthetic glow when focused */}
              <div className="absolute -inset-1 bg-brand-red/5 rounded-xl blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity -z-10" />
            </div>
          </div>
          <button
            className={cn(
              "rounded-lg w-full flex items-center cursor-pointer justify-center h-9 gap-2 text-[11px] font-bold transition-all shadow-sm",
              aiQuery.trim()
                ? "bg-redmix text-white hover:bg-redmix/90 active:scale-95"
                : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed",
            )}
            disabled={!aiQuery.trim()}
          >
            ASK AI SEARCH
            <Sparkles className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
