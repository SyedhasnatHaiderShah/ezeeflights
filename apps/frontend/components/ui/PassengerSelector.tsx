"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Separator from "@radix-ui/react-separator";
import { Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CounterInput } from "./CounterInput";

interface Passengers {
  adults: number;
  children: number;
  infants: number;
}

interface PassengerSelectorProps {
  passengers: Passengers;
  onChange: (key: keyof Passengers, value: number) => void;
  cabinClass: string | null;
  onCabinChange?: (cabinClass: string) => void;
  className?: string;
}

export function PassengerSelector({
  passengers,
  onChange,
  cabinClass,
  onCabinChange,
  className,
}: PassengerSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const total =
    passengers.adults + (passengers.children || 0) + (passengers.infants || 0);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "w-full flex items-center justify-between px-3 transition-colors group border-r border-border last:border-r-0 relative overflow-hidden",
            className,
          )}
          aria-haspopup="dialog"
        >
          <div className="flex items-center gap-2 overflow-hidden relative z-10">
            <Users className="w-4 h-4 text-foreground/60 group-hover:text-brand-red transition-colors shrink-0" />
            <div className="flex flex-col items-start min-w-0">
              <span className="text-xs font-medium text-brand-red capitalize leading-none mb-0.5 whitespace-nowrap">
                Passengers
              </span>
              <span className="text-sm font-semibold text-foreground whitespace-nowrap truncate">
                {total} {total > 1 ? "guests" : "guest"}
                {cabinClass ? `, ${cabinClass}` : ""}
              </span>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 opacity-70 transition-transform duration-200 relative z-10 group-hover:text-brand-red",
              open && "rotate-180",
            )}
          />
          <div className="shimmer-effect" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-background rounded-sm shadow-2xl border border-border p-3 w-64 z-50 animate-in fade-in zoom-in-95 duration-200"
          sideOffset={8}
          align="start"
        >
          {/* Passenger counters */}
          {(["adults", "children", "infants"] as const).map((key) => {
            const labelsMap = {
              adults: { label: "Adults", subtitle: "18+", min: 1, max: 9 },
              children: { label: "Children", subtitle: "2–17", min: 0, max: 8 },
              infants: {
                label: "Infants",
                subtitle: "Under 2",
                min: 0,
                max: passengers.adults,
              },
            };
            const { label, subtitle, min, max } = labelsMap[key];

            return (
              <div
                key={key}
                className="flex items-center justify-between py-1.5"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {label}
                  </p>
                  <p className="text-xs text-foreground/50 font-medium leading-tight">
                    {subtitle}
                  </p>
                </div>
                <CounterInput
                  value={passengers[key]}
                  min={min}
                  max={max}
                  onChange={(val) => onChange(key, val)}
                  ariaLabel={label}
                />
              </div>
            );
          })}

          {onCabinChange && (
            <>
              <Separator.Root className="bg-border h-px my-3" />
              <div className="pt-1">
                <p className="text-xs font-semibold text-foreground/50 capitalize tracking-wider mb-2">
                  Cabin Class
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["Economy", "Premium", "Business", "First"].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => onCabinChange(cls)}
                      className={cn(
                        "py-1.5 px-2 text-xs capitalize font-semibold rounded-sm border transition-all",
                        cabinClass === cls
                          ? "bg-brand-red text-white border-brand-red shadow-md"
                          : "border-border text-foreground/60 hover:border-brand-red/40",
                      )}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            onClick={() => setOpen(false)}
            className="bg-redmix mt-4 w-full text-white py-2 rounded-sm text-xs font-semibold capitalize tracking-widest hover:bg-brand-red/90 transition-all hover:shadow-lg hover:shadow-brand-red/20"
          >
            Done
          </button>

          <Popover.Arrow className="fill-brand-gray" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
