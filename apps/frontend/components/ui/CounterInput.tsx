"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"

interface CounterInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  ariaLabel?: string;
}

export function CounterInput({
  value,
  min = 0,
  max = 9,
  onChange,
  ariaLabel
}: CounterInputProps) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${ariaLabel}`}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:border-brand-red hover:text-brand-red disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-6 text-center text-sm font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${ariaLabel}`}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground/60 hover:border-brand-red hover:text-brand-red disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  )
}
