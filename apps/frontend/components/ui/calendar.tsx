"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  numberOfMonths: propsNumberOfMonths,
  ...props
}: CalendarProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const numberOfMonths = isMobile ? 1 : (propsNumberOfMonths ?? 1);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      numberOfMonths={numberOfMonths}
      className={cn("p-4 sm:p-4 relative bg-background", className)}
      classNames={{
        months: "flex flex-col sm:flex-row items-start justify-center gap-10",
        month: "space-y-4 w-full",
        // @ts-ignore
        month_caption: "flex justify-center relative items-center h-10 mb-2",
        caption_label:
          "text-sm font-bold text-foreground dark:text-white tracking-tight px-10",
        nav: "flex items-center absolute top-2 left-0 right-0 justify-between px-2 w-full z-20 pointer-events-none",
        button_previous: cn(
          "h-8 w-8 bg-background border border-border shadow-sm rounded-full flex items-center justify-center text-foreground hover:bg-brand-red/10 hover:text-brand-red transition-all active:scale-90 pointer-events-auto",
        ),
        button_next: cn(
          "h-8 w-8 bg-background border border-border shadow-sm rounded-full flex items-center justify-center text-foreground hover:bg-brand-red/10 hover:text-brand-red transition-all active:scale-90 pointer-events-auto",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex mb-1",
        weekday:
          "text-muted-foreground dark:text-blue-200/70 w-10 h-8 text-[11px] font-semibold text-center flex items-center justify-center",
        week: "flex w-full",
        // @ts-ignore
        cell: cn(
          "w-8 h-8 flex items-center justify-center text-center p-0 relative focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-ezee-red/15"
            : "[&:has([aria-selected])]:bg-transparent",
        ),
        // @ts-ignore
        day_button: cn(
          "w-10 h-10 p-0 text-foreground dark:text-foreground/90 font-medium rounded-full hover:bg-brand-red/10 hover:text-white transition-colors flex items-center justify-center text-sm cursor-pointer",
        ),
        // @ts-ignore
        range_end: "day-range-end",
        selected:
          "bg-redmix !text-white font-bold shadow-md rounded-full hover:bg-redmix hover:text-white focus:bg-redmix focus:text-white",
        // @ts-ignore
        today:
          "font-bold text-brand-red dark:text-brand-red after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-brand-red",
        outside:
          "text-muted-foreground/30 opacity-40 aria-selected:bg-brand-red/10 aria-selected:text-muted-foreground aria-selected:opacity-20",
        disabled: "text-muted-foreground/30 opacity-30 cursor-not-allowed",
        // @ts-ignore
        range_middle:
          "aria-selected:bg-brand-red/10 aria-selected:text-foreground rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        // @ts-ignore
        Chevron: ({ orientation, className, ...props }) =>
          orientation === "left" ? (
            <ChevronLeft
              className={cn("h-4 w-4 shrink-0", className)}
              {...props}
            />
          ) : (
            <ChevronRight
              className={cn("h-4 w-4 shrink-0", className)}
              {...props}
            />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
