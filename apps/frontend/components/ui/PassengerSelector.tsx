"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Separator from "@radix-ui/react-separator";
import { Users, ChevronDown, User, Baby, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { CounterInput } from "./CounterInput";
import { useTranslation } from "react-i18next";
import {
  applyPassengerChange,
  getPassengerLimits,
  type FlightPassengers,
} from "@/lib/passengers";
import { isNative } from "@/lib/capacitor/platform";

interface PassengerSelectorProps {
  passengers: FlightPassengers;
  onChange: (passengers: FlightPassengers) => void;
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
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [interactionMode, setInteractionMode] = React.useState<
    "idle" | "hover" | "click"
  >("idle");
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const clearHideTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  };

  const scheduleHide = () => {
    if (!openOnHover) return;
    clearHideTimeout();
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
    if (interactionMode !== "click") {
      setOpen(true);
      setInteractionMode("hover");
    }
  };

  const handleMouseLeave = () => {
    if (!openOnHover) return;
    scheduleHide();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearHideTimeout();
    if (open) {
      setOpen(false);
      setInteractionMode("idle");
    } else {
      setOpen(true);
      setInteractionMode("click");
    }
  };

  const closePopover = React.useCallback(() => {
    setOpen(false);
    setInteractionMode("idle");
    clearHideTimeout();
  }, []);

  // Click outside handler (exclude portaled popover content)
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-radix-popper-content-wrapper]")
      ) {
        return;
      }
      closePopover();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [closePopover]);

  // Keep popover under the fixed header when the page scrolls
  React.useEffect(() => {
    if (!open) return;
    const handleScroll = () => closePopover();
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [open, closePopover]);

  const total =
    passengers.adults + (passengers.children || 0) + (passengers.infants || 0);
  const normalizeCabinClass = (value: string | null) => {
    if (!value) return null;
    const v = value.trim();
    if (v === "经济舱") return "Economy";
    if (v === "公务舱") return "Business";
    if (v === "头等舱") return "First";
    if (
      v === "PremiumEconomy" ||
      v === "Premium_Economy" ||
      v === "Premium Economy"
    ) {
      return "Premium";
    }
    return v;
  };
  const cabinClassLabel = normalizeCabinClass(cabinClass);
  const cabinSummary =
    cabinClassLabel === "Economy"
      ? t(", Economy")
      : cabinClassLabel
        ? `, ${t(cabinClassLabel)}`
        : "";

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <button
            type="button"
            className={cn(
              "flex items-center justify-between px-3 transition-colors group relative overflow-hidden h-full w-full",
              glassPopover
                ? "bg-[#0e0e0e]/60 text-white hover:bg-white/10"
                : "bg-transparent text-foreground hover:bg-muted/30",
              open && (glassPopover ? "bg-white/10" : "bg-muted/30"),
              className,
            )}
            onClick={handleClick}
          >
            <div className="flex items-center gap-2 overflow-hidden relative z-10">
              <div className="flex flex-col items-start min-w-0">
                <span
                  className={cn(
                    "text-xs font-medium capitalize leading-none mb-0.5 whitespace-nowrap",
                    glassPopover ? "text-white/70" : "text-foreground/70",
                  )}
                >
                  {mounted ? t("Passengers") : "Passengers"}
                </span>
                <div className="flex items-baseline gap-1 overflow-hidden w-full">
                  <span
                    className={cn(
                      "text-sm font-semibold whitespace-nowrap",
                      glassPopover ? "text-white" : "text-foreground",
                    )}
                  >
                    {mounted
                      ? (total > 1 ? `${total} ${t("guests")}` : t("1 guest"))
                      : (total > 1 ? `${total} guests` : "1 guest")}
                  </span>
                  {cabinSummary && (
                    <span
                      className={cn(
                        "text-[11px] font-medium whitespace-nowrap truncate",
                        glassPopover
                          ? "text-white/60"
                          : "text-muted-foreground",
                      )}
                    >
                      {cabinSummary}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="shimmer-effect" />
          </button>
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            className={cn(
              "z-[100] w-64 rounded-sm border p-3 shadow-2xl focus:outline-none transition-all duration-200 animate-in fade-in zoom-in-95",
              glassPopover
                ? cn(
                    "border-[#0e0e0e]/60 text-white",
                    isNative()
                      ? "bg-[#0e0e0e]"
                      : "bg-[#0e0e0e]/60 backdrop-blur-2xl",
                  )
                : "border-border bg-background text-foreground",
            )}
            style={{ zIndex: 100 }}
            side="bottom"
            sideOffset={8}
            align="start"
            collisionPadding={{ top: 72 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={closePopover}
            onEscapeKeyDown={closePopover}
          >
            {/* Passenger counters */}
            {(["adults", "children", "infants"] as const).map((key) => {
              const labelsMap = {
                adults: {
                  label: t("Adults"),
                  subtitle: t("12+"),
                  icon: User,
                },
                children: {
                  label: t("Children"),
                  subtitle: t("2–12"),
                  icon: UserRound,
                },
                infants: {
                  label: t("Infants"),
                  subtitle: t("Under 2"),
                  icon: Baby,
                },
              };
              const { label, subtitle, icon: Icon } = labelsMap[key];
              const { min, max } = getPassengerLimits(passengers, key);

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
                      <p
                        className={cn(
                          "text-sm font-bold",
                          glassPopover ? "text-white" : "text-foreground",
                        )}
                      >
                        {label}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-medium leading-tight",
                          glassPopover ? "text-white" : "text-foreground/50",
                        )}
                      >
                        {subtitle}
                      </p>
                    </div>
                  </div>
                  <CounterInput
                    value={passengers[key]}
                    min={min}
                    max={max}
                    onChange={(val) =>
                      onChange(applyPassengerChange(passengers, key, val))
                    }
                    ariaLabel={label}
                    glass={glassPopover}
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
                  <p
                    className={cn(
                      "text-xs font-semibold capitalize tracking-wider mb-2",
                      glassPopover ? "text-white" : "text-foreground/50",
                    )}
                  >
                    {t("Cabin Class")}
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
                          cabinClassLabel === cls
                            ? "bg-redmix text-white border-redmix shadow-md"
                            : cn(
                                "text-foreground hover:border-redmix/40",
                                glassPopover
                                  ? "border-white/20 text-white/70"
                                  : "border-border",
                              ),
                        )}
                      >
                        {t(cls)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
