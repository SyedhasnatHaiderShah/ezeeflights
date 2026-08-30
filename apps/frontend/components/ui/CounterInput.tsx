"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CounterInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  ariaLabel?: string;
  glass?: boolean;
}

export function CounterInput({
  value,
  min = 0,
  max = 9,
  onChange,
  ariaLabel,
  glass = false,
}: CounterInputProps) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${ariaLabel}`}
        className={cn(
          "w-6 h-6 rounded-full border flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed",
          glass
            ? "border-white/30 text-white/70 hover:border-white hover:text-white"
            : "border-border text-foreground/60 hover:border-redmix hover:text-redmix",
        )}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span
        className={cn(
          "w-6 text-center text-sm font-semibold tabular-nums",
          glass ? "text-white" : "text-foreground",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${ariaLabel}`}
        className={cn(
          "w-6 h-6 rounded-full border flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed",
          glass
            ? "border-white text-white hover:border-white hover:text-white"
            : "border-border text-foreground/80 hover:border-redmix hover:text-redmix",
        )}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
