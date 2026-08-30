"use client";

import * as React from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { isNative } from "@/lib/capacitor/platform";

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
  fromDate?: Date;
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
  openOnHover = false,
  disablePastDates = false,
  fromYear = 1970,
  toYear = new Date().getFullYear() + 5,
  fromDate,
  captionLayout = "label",
}: DatePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  
  const isValidDate = (d: any): d is Date => {
    return d instanceof Date && !isNaN(d.getTime());
  };

  const [month, setMonth] = React.useState<Date | undefined>(() => {
    if (date && isValidDate(date)) return date;
    if (defaultMonth) return defaultMonth;
    const now = new Date();
    if (toYear && now.getFullYear() > toYear) {
      now.setFullYear(toYear);
    } else if (fromYear && now.getFullYear() < fromYear) {
      now.setFullYear(fromYear);
    }
    return now;
  });
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (date && isValidDate(date)) {
      setMonth(date);
    } else if (defaultMonth && !date) {
      setMonth(defaultMonth);
    }
  }, [date, defaultMonth]);

  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    setMounted(true);
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hasDate = mounted && date && isValidDate(date);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          aria-disabled={disabled}
          className={cn(
            "w-full justify-between h-full px-3 py-2 transition-colors group rounded-none border-none shadow-none outline-none ring-0",
            glassPopover
              ? "bg-[#0e0e0e]/60 hover:bg-white/10 text-white"
              : "bg-transparent hover:bg-muted/50 text-foreground",
            open && (glassPopover ? "bg-white/10 z-10" : "bg-muted/50 z-10"),
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          onMouseEnter={() => {
            if (!openOnHover || isTouchDevice) return;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setOpen(true);
          }}
          onMouseLeave={() => {
            if (!openOnHover || isTouchDevice) return;
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
                {mounted ? t(label) : label}
              </span>
            )}
            <div className="flex items-center gap-1.5 w-full">
              <span
                className={cn(
                  "truncate font-semibold tracking-tight",
                  glassPopover ? "text-sm" : "text-xs",
                  hasDate
                    ? glassPopover
                      ? "text-white"
                      : "text-foreground"
                    : glassPopover
                      ? "text-white/60"
                      : "text-foreground/60",
                )}
              >
                {/* Render formatted date if valid, otherwise render default placeholder */}
                {hasDate && date
                  ? format(date, "EEE, MMM d, yyyy")
                  : open
                    ? ""
                    : (mounted ? t("Choose date") : "Choose date")}
              </span>
            </div>
          </div>
          {/* <ChevronDown
            className={cn(
              "ml-1 h-3.5 w-3.5 shrink-0 transition-all duration-300",
              glassPopover ? "text-white/60" : "text-foreground/40",
              "group-hover:text-foreground group-hover:opacity-100 transition-all",
              open && "rotate-180",
            )}
          /> */}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "z-[200] w-auto overflow-hidden rounded-md border p-0 shadow-2xl",
          glassPopover
            ? cn(
                "border-white/20 text-white",
                isNative()
                  ? "bg-[#0e0e0e]"
                  : "bg-[#0e0e0e]/60 backdrop-blur-2xl",
              )
            : "border-border bg-background text-foreground",
        )}
        align="start"
        sideOffset={10}
        onMouseEnter={() => {
          if (!openOnHover || isTouchDevice) return;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onMouseLeave={() => {
          if (!openOnHover || isTouchDevice) return;
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
                    "enabled:pointer-events-auto disabled:pointer-events-none disabled:opacity-20 disabled:cursor-not-allowed h-8 w-8 rounded-full border border-white/20 bg-white/10 text-white shadow-sm transition-all hover:bg-white/20 hover:text-white flex items-center justify-center enabled:cursor-pointer",
                  button_next:
                    "enabled:pointer-events-auto disabled:pointer-events-none disabled:opacity-20 disabled:cursor-not-allowed h-8 w-8 rounded-full border border-white/20 bg-white/10 text-white shadow-sm transition-all hover:bg-white/20 hover:text-white flex items-center justify-center enabled:cursor-pointer",
                  month_caption:
                    "flex justify-center items-center h-8 relative gap-1 px-0",
                  nav: "flex items-center justify-between absolute top-2 sm:top-4 left-1.5 right-1.5 w-[calc(100%-12px)] z-10 pointer-events-none",
                  day_button:
                    "w-7 h-7 sm:w-7 sm:h-7 p-0 text-white font-medium rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-sm cursor-pointer",
                  cell: "w-full h-7 sm:h-7 flex items-center justify-center text-center p-0 relative",
                  caption_label:
                    "text-white font-semibold tracking-tight px-0 text-sm",
                  weekday:
                    "text-white/60 w-full h-8 text-[11px] font-semibold text-center flex items-center justify-center",
                  weekdays: "grid grid-cols-7 w-full mb-1",
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
          fromDate={fromDate || (disablePastDates ? startOfDay(new Date()) : undefined)}
          startMonth={fromDate || (disablePastDates ? startOfDay(new Date()) : (fromYear ? new Date(fromYear, 0) : undefined))}
          endMonth={toYear ? new Date(toYear, 11) : undefined}
          month={month}
          onMonthChange={setMonth}
          fromYear={fromYear}
          toYear={toYear}
          captionLayout={captionLayout}
        />
      </PopoverContent>
    </Popover>
  );
}
