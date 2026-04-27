"use client";

import * as React from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label?: string;
  variant?: string;
  className?: string;
  numberOfMonths?: number;
  disabled?: boolean;
  calendarDisabled?: any;
  defaultMonth?: Date;
  glassPopover?: boolean;
  openOnHover?: boolean;
  disablePastDates?: boolean;
  fromYear?: number;
  toYear?: number;
  captionLayout?: "label" | "dropdown";
}

export function DatePicker({
  date,
  setDate,
  label = "Pick a date",
  variant = "default",
  className = "",
  numberOfMonths = 1,
  disabled = false,
  calendarDisabled,
  defaultMonth,
  glassPopover = false,
  openOnHover = true,
  disablePastDates = false,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  captionLayout = "dropdown",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  // Cleanup timeout on unmount
  React.useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hasDate = mounted && Boolean(date);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          aria-disabled={disabled}
          className={cn(
            "w-full justify-between h-full px-3 py-2 bg-transparent hover:bg-redmix/5 transition-colors group rounded-none border-none shadow-none outline-none ring-0",
            open && "bg-redmix/5 z-10",
            date && "bg-transparent",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          onMouseEnter={() => {
            if (!openOnHover) return;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setOpen(true);
          }}
          onMouseLeave={() => {
            if (!openOnHover) return;
            timeoutRef.current = setTimeout(() => {
              setOpen(false);
            }, 150);
          }}
        >
          <div className="flex flex-col items-start flex-1 min-w-0">
            {label && (
              <span
                className={cn(
                  "text-[10px] font-semibold capitalize leading-none mb-0.5 tracking-tight",
                  glassPopover ? "text-white/70" : "text-foreground/70",
                )}
              >
                {label}
              </span>
            )}
            <div className="flex items-center gap-1.5 w-full">
              <span
                className={cn(
                  "truncate font-semibold text-sm tracking-tight",
                  hasDate
                    ? glassPopover
                      ? "text-white"
                      : "text-foreground"
                    : glassPopover
                      ? "text-white/60"
                      : "text-foreground/60",
                )}
              >
                {hasDate && date
                  ? format(date, "EEE, MMM d")
                  : open
                    ? ""
                    : "Choose date"}
              </span>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "ml-1 h-3.5 w-3.5 shrink-0 transition-all duration-300",
              glassPopover ? "text-white/60" : "text-foreground/40",
              "group-hover:text-foreground group-hover:opacity-100 transition-all",
              open && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto overflow-hidden rounded-2xl border p-0 shadow-2xl",
          glassPopover
            ? "border-white/20 bg-white/10 backdrop-blur-2xl text-white"
            : "border-border bg-background text-foreground",
        )}
        align="start"
        sideOffset={10}
        onMouseEnter={() => {
          if (!openOnHover) return;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onMouseLeave={() => {
          if (!openOnHover) return;
          timeoutRef.current = setTimeout(() => {
            setOpen(false);
          }, 150);
        }}
      >
        <Calendar
          className={glassPopover ? "bg-transparent" : undefined}
          classNames={
            glassPopover
              ? {
                  button_previous:
                    "pointer-events-auto h-7 w-7 rounded-full border border-white/20 bg-white/10 text-white shadow-sm transition-all hover:bg-white/20 hover:text-white flex items-center justify-center cursor-pointer",
                  button_next:
                    "pointer-events-auto h-7 w-7 rounded-full border border-white/20 bg-white/10 text-white shadow-sm transition-all hover:bg-white/20 hover:text-white flex items-center justify-center cursor-pointer",
                  day_button:
                    "w-8 h-8 p-0 text-white font-medium rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-sm cursor-pointer",
                  caption_label: "text-white font-bold tracking-tight px-10",
                  weekday:
                    "text-white/60 w-10 h-8 text-[11px] font-semibold text-center flex items-center justify-center",
                  disabled: "text-white/20 opacity-30 cursor-not-allowed",
                  today:
                    "text-white font-bold relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-white",
                  outside: "text-white/20 opacity-30",
                }
              : undefined
          }
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d);
            setOpen(false);
          }}
          initialFocus
          numberOfMonths={numberOfMonths}
          disabled={
            calendarDisabled ||
            (disablePastDates
              ? (date: Date) =>
                  isBefore(startOfDay(date), startOfDay(new Date()))
              : undefined)
          }
          defaultMonth={defaultMonth || date || new Date(toYear, 0, 1)}
          fromYear={fromYear}
          toYear={toYear}
          captionLayout={captionLayout}
        />
      </PopoverContent>
    </Popover>
  );
}
