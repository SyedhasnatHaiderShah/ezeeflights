"use client";

import * as React from "react";
import { format } from "date-fns";
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
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          aria-disabled={disabled}
          className={cn(
            "w-full justify-between min-w-40 h-full px-4 py-2 bg-background hover:bg-muted transition-all group rounded-none border-border",
            date && "bg-background",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-foreground capitalize leading-none mb-0.5 tracking-tight">
              {label}
            </span>
            <div className="flex items-center gap-1.5 w-full">
              <CalendarIcon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-colors",
                  date ? "text-foreground" : "text-foreground/60",
                )}
              />
              <span
                className={cn(
                  "truncate font-semibold text-sm tracking-tight",
                  date ? "text-foreground" : "text-foreground/60",
                )}
              >
                {date ? format(date, "EEE, MMM d") : open ? "" : "Choose date"}
              </span>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "ml-1 h-3.5 w-3.5 shrink-0 text-foreground/50 group-hover:text-foreground transition-all duration-300",
              open && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border border-border bg-background text-foreground shadow-2xl rounded-2xl overflow-hidden"
        align="start"
        sideOffset={10}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d);
            setOpen(false);
          }}
          initialFocus
          numberOfMonths={numberOfMonths}
          disabled={calendarDisabled}
          defaultMonth={defaultMonth}
        />
      </PopoverContent>
    </Popover>
  );
}
