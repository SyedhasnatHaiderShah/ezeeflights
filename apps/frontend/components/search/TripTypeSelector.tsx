"use client"

import * as React from "react"
import * as RadioGroup from "@radix-ui/react-radio-group"
import * as Label from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

interface TripTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TripTypeSelector({ value, onChange }: TripTypeSelectorProps) {
  const options = [
    { value: 'round-trip', label: 'Round-trip' },
    { value: 'one-way', label: 'One-way' },
    { value: 'multi-city', label: 'Multi-city' },
  ]

  return (
    <RadioGroup.Root
      value={value}
      onValueChange={onChange}
      className="flex gap-5 mb-3"
      aria-label="Trip type"
    >
      {options.map((type) => (
        <div key={type.value} className="flex items-center gap-2 group cursor-pointer">
          <RadioGroup.Item
            value={type.value}
            id={`trip-${type.value}`}
            className="w-3.5 h-3.5 rounded-full border border-brand-gray cursor-pointer
                       data-[state=checked]:border-brand-red
                       data-[state=checked]:bg-brand-red focus:outline-none transition-all
                       group-hover:border-brand-red/50"
          >
            <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative">
              <span className="w-1 h-1 rounded-full bg-white animate-in zoom-in-50" />
            </RadioGroup.Indicator>
          </RadioGroup.Item>
          <Label.Root
            htmlFor={`trip-${type.value}`}
            className="text-xs font-semibold capitalize tracking-widest cursor-pointer text-gray-500 group-data-[state=checked]:text-brand-dark transition-colors"
          >
            {type.label}
          </Label.Root>
        </div>
      ))}
    </RadioGroup.Root>
  )
}
