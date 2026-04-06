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
        className="w-6 h-6 rounded-full border border-brand-gray flex items-center justify-center text-brand-dark/60 hover:border-brand-red hover:text-brand-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="w-2 h-2" />
      </button>
      <span className="w-4 text-center text-xs font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${ariaLabel}`}
        className="w-6 h-6 rounded-full border border-brand-gray flex items-center justify-center text-brand-dark/60 hover:border-brand-red hover:text-brand-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-2 h-2" />
      </button>
    </div>
  )
}
