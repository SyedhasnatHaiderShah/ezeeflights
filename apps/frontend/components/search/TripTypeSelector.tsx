"use client";

import * as React from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Label from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

interface TripTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TripTypeSelector({ value, onChange }: TripTypeSelectorProps) {
  const options = [
    { value: "round-trip", label: "Round-trip" },
    { value: "one-way", label: "One-way" },
    { value: "multi-city", label: "Multi-city" },
  ];

  return (
    <div className="w-full relative">
      <RadioGroup.Root
        value={value}
        onValueChange={onChange}
        className="flex lg:flex-wrap items-center gap-x-6 lg:gap-x-8 gap-y-3 mb-5 px-1 overflow-x-auto lg:overflow-visible no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0"
        aria-label="Trip type"
      >
        {options.map((type) => (
          <div
            key={type.value}
            className="flex items-center gap-2 group cursor-pointer select-none shrink-0 py-1"
          >
            <RadioGroup.Item
              value={type.value}
              id={`trip-${type.value}`}
              className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 cursor-pointer
                         data-[state=checked]:border-brand-red
                         data-[state=checked]:bg-brand-red focus:outline-none transition-all
                         group-hover:border-brand-red/50 shrink-0 shadow-sm"
            >
              <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in-50" />
              </RadioGroup.Indicator>
            </RadioGroup.Item>
            <Label.Root
              htmlFor={`trip-${type.value}`}
              className="text-xs font-semibold tracking-widest cursor-pointer text-muted-foreground group-data-[state=checked]:text-foreground whitespace-nowrap transition-colors"
            >
              {type.label}
            </Label.Root>
          </div>
        ))}
      </RadioGroup.Root>
    </div>
  );
}
