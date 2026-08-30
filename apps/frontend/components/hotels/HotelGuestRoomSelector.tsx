"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Separator from "@radix-ui/react-separator";
import { Users, ChevronDown, User, Baby, UserRound, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { CounterInput } from "../ui/CounterInput";
import { isNative } from "@/lib/capacitor/platform";

interface Guests {
  adults: number;
  children: number;
  rooms: number;
}

interface GuestRoomSelectorProps {
  guests: Guests;
  onChange: (key: keyof Guests, value: number) => void;
  className?: string;
  glassPopover?: boolean;
}

export function HotelGuestRoomSelector({
  guests,
  onChange,
  className,
  glassPopover = false,
}: GuestRoomSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const totalGuests = guests.adults + guests.children;

  return (
    <div className="contents">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              "flex items-center justify-between gap-2 px-3 bg-transparent hover:bg-brand-red/5 transition-colors group relative h-full w-full min-w-0",
              open && "bg-brand-red/5 z-10",
              className,
            )}
            aria-haspopup="dialog"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 relative z-10">
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span
                  className={cn(
                    "text-xs font-medium capitalize leading-none mb-0.5 whitespace-nowrap",
                    glassPopover ? "text-white/70" : "text-foreground/70",
                  )}
                >
                  Guests & Rooms
                </span>
                <div className="flex items-baseline gap-1 w-full min-w-0">
                  <span
                    className={cn(
                      "text-sm font-semibold truncate max-w-full",
                      glassPopover ? "text-white" : "text-foreground",
                    )}
                  >
                    {totalGuests} {totalGuests > 1 ? "Guests" : "Guest"},{" "}
                    {guests.rooms} {guests.rooms > 1 ? "Rooms" : "Room"}
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 opacity-70 transition-transform duration-200 relative z-10 group-hover:text-redmix",
                open && "rotate-180",
                glassPopover ? "text-white" : "text-foreground",
              )}
            />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={cn(
              "z-50 w-72 rounded-sm border p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 focus:outline-none",
              glassPopover
                ? cn(
                    "border-white/20 text-white",
                    isNative() ? "bg-[#0e0e0e]" : "bg-white/10 backdrop-blur-2xl"
                  )
                : "border-border bg-background text-foreground",
            )}
            sideOffset={8}
            align="start"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-redmix text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Adults</p>
                    <p className="text-xs text-muted-foreground">Ages 18+</p>
                  </div>
                </div>
                <CounterInput
                  value={guests.adults}
                  min={1}
                  max={10}
                  onChange={(val) => onChange("adults", val)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-redmix text-white">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Children</p>
                    <p className="text-xs text-muted-foreground">Ages 0-17</p>
                  </div>
                </div>
                <CounterInput
                  value={guests.children}
                  min={0}
                  max={10}
                  onChange={(val) => onChange("children", val)}
                />
              </div>

              <Separator.Root className="h-px bg-border" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-redmix text-white">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Rooms</p>
                  </div>
                </div>
                <CounterInput
                  value={guests.rooms}
                  min={1}
                  max={5}
                  onChange={(val) => onChange("rooms", val)}
                />
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
