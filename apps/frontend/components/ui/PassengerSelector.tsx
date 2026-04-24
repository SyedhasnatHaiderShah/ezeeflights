"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Separator from "@radix-ui/react-separator";
import { Users, ChevronDown, User, Baby, UserRound } from "lucide-react";
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
  glassPopover?: boolean;
  openOnHover?: boolean;
}

export function PassengerSelector({
  passengers,
  onChange,
  cabinClass,
  onCabinChange,
  className,
  glassPopover = false,
  openOnHover = true,
}: PassengerSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [interactionMode, setInteractionMode] = React.useState<
    "idle" | "hover" | "click"
  >("idle");
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const clearHideTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  };

  const closePopover = () => {
    clearHideTimeout();
    setOpen(false);
    setInteractionMode("idle");
  };

  const scheduleHide = () => {
    if (!openOnHover) return;
    clearHideTimeout();
    // Only schedule hide if we're in hover mode
    if (interactionMode === "hover") {
      timeoutRef.current = setTimeout(() => {
        setOpen(false);
        setInteractionMode("idle");
      }, 150);
    }
  };

  const handleMouseEnter = () => {
    if (!openOnHover) return;
    clearHideTimeout();
    // Only auto-open on hover if not in click mode
    if (interactionMode !== "click") {
      setOpen(true);
      setInteractionMode("hover");
    }
  };

  const handleMouseLeave = () => {
    if (!openOnHover) return;
    scheduleHide();
  };

  const handleClick = () => {
    clearHideTimeout();

    if (!open) {
      // Opening via click
      setOpen(true);
      setInteractionMode("click");
    } else {
      // Closing via click (only if we're in click mode)
      if (interactionMode === "click") {
        setOpen(false);
        setInteractionMode("idle");
      } else if (interactionMode === "hover") {
        // If opened by hover, clicking should switch to click mode and keep it open
        setInteractionMode("click");
      }
    }
  };

  // Reset when popover closes externally (click outside)
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setInteractionMode("idle");
    }
    setOpen(newOpen);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const total =
    passengers.adults + (passengers.children || 0) + (passengers.infants || 0);

  return (
    <div
      className="contents"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Popover.Root open={open} onOpenChange={handleOpenChange} modal={false}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              "flex items-center justify-between px-3 bg-transparent hover:bg-brand-red/5 transition-colors group relative overflow-hidden h-full w-full",
              open && "bg-brand-red/5 z-10",
              className,
            )}
            aria-haspopup="dialog"
            onClick={handleClick}
          >
            <div className="flex items-center gap-2 overflow-hidden relative z-10">
              <div className="flex flex-col items-start min-w-0">
                <span className={cn(
                  "text-xs font-medium capitalize leading-none mb-0.5 whitespace-nowrap",
                  glassPopover ? "text-white/70" : "text-foreground/70"
                )}>
                  Passengers
                </span>
                <div className="flex items-baseline gap-1 overflow-hidden w-full">
                  <span className={cn(
                    "text-sm font-semibold whitespace-nowrap",
                    glassPopover ? "text-white" : "text-foreground"
                  )}>
                    {total} {total > 1 ? "guests" : "guest"}
                  </span>
                  {cabinClass && (
                    <span className={cn(
                      "text-[11px] font-medium whitespace-nowrap truncate",
                      glassPopover ? "text-white/60" : "text-muted-foreground"
                    )}>
                      , {cabinClass}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 opacity-70 transition-transform duration-200 relative z-10 group-hover:text-redmix",
                open && "rotate-180",
                glassPopover ? "text-white" : "text-foreground"
              )}
            />
            <div className="shimmer-effect" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={cn(
              "z-50 w-64 rounded-sm border p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200 focus:outline-none",
              glassPopover
                ? "border-white/20 bg-white/10 text-foreground backdrop-blur-2xl"
                : "border-border bg-background",
            )}
            sideOffset={8}
            align="start"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={closePopover}
            onEscapeKeyDown={closePopover}
          >
            {/* Passenger counters */}
            {(["adults", "children", "infants"] as const).map((key) => {
              const labelsMap = {
                adults: {
                  label: "Adults",
                  subtitle: "18+",
                  min: 1,
                  max: 9,
                  icon: User,
                },
                children: {
                  label: "Children",
                  subtitle: "2–17",
                  min: 0,
                  max: 8,
                  icon: UserRound,
                },
                infants: {
                  label: "Infants",
                  subtitle: "Under 2",
                  min: 0,
                  max: passengers.adults,
                  icon: Baby,
                },
              };
              const { label, subtitle, min, max, icon: Icon } = labelsMap[key];

              return (
                <div
                  key={key}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-redmix text-white shrink-0">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-foreground/50 font-medium leading-tight">
                        {subtitle}
                      </p>
                    </div>
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
                <Separator.Root
                  className={cn(
                    "my-3 h-px",
                    glassPopover ? "bg-white/15" : "bg-border",
                  )}
                />
                <div className="pt-1">
                  <p className="text-xs font-semibold text-foreground/50 capitalize tracking-wider mb-2">
                    Cabin Class
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {["Economy", "Premium", "Business", "First"].map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onCabinChange(cls);
                          setOpen(false);
                          setInteractionMode("idle");
                        }}
                        className={cn(
                          "py-1.5 px-2 text-xs capitalize font-semibold rounded-sm border transition-all",
                          cabinClass === cls
                            ? "bg-redmix text-white border-redmix shadow-md"
                            : cn(
                                "text-foreground/60 hover:border-redmix/40",
                                glassPopover
                                  ? "border-white/20 text-white/70"
                                  : "border-border",
                              ),
                        )}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Popover.Arrow
              className={cn(glassPopover ? "fill-white/10" : "fill-background")}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
