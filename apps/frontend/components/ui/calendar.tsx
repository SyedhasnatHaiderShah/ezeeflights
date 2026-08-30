"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DropdownProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "./scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  enUS,
  hi,
  zhCN,
  zhTW,
  ar,
  es,
  fr,
  de,
  tr,
  et,
  ja,
  ko,
  th
} from "date-fns/locale";

const createCustomLocale = (localeCode: string, baseLocale: any) => {
  const monthsFull = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2021, i, 1);
    return new Intl.DateTimeFormat(localeCode, { month: "long" }).format(date);
  });
  const monthsShort = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2021, i, 1);
    return new Intl.DateTimeFormat(localeCode, { month: "short" }).format(date);
  });
  const weekdaysFull = Array.from({ length: 7 }, (_, i) => {
    // 2021-01-03 is a Sunday
    const date = new Date(2021, 0, 3 + i);
    return new Intl.DateTimeFormat(localeCode, { weekday: "long" }).format(date);
  });
  const weekdaysShort = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2021, 0, 3 + i);
    return new Intl.DateTimeFormat(localeCode, { weekday: "short" }).format(date);
  });
  const weekdaysNarrow = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2021, 0, 3 + i);
    return new Intl.DateTimeFormat(localeCode, { weekday: "narrow" }).format(date);
  });

  return {
    ...baseLocale,
    code: localeCode,
    localize: {
      ...baseLocale.localize,
      month: (n: number, options?: { width?: string }) => {
        const width = options?.width || "wide";
        if (width === "abbreviated" || width === "narrow") {
          return monthsShort[n];
        }
        return monthsFull[n];
      },
      day: (n: number, options?: { width?: string }) => {
        const width = options?.width || "wide";
        if (width === "narrow") return weekdaysNarrow[n];
        if (width === "abbreviated" || width === "short") return weekdaysShort[n];
        return weekdaysFull[n];
      },
      ordinalNumber: (n: number) => String(n),
    },
  };
};

const customUrdu = createCustomLocale("ur", enUS);
const customTagalog = createCustomLocale("tl", enUS);

const localeMap: Record<string, any> = {
  en: enUS,
  hi: hi,
  "zh-hans": zhCN,
  "zh-hant": zhTW,
  ar: ar,
  ur: customUrdu,
  tl: customTagalog,
  es: es,
  fr: fr,
  de: de,
  tr: tr,
  et: et,
  jpn: ja,
  ko: ko,
  th: th,
};

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
  const { i18n } = useTranslation();
  const currentLocale = localeMap[i18n.language] || enUS;

  return (
    <DayPicker
      locale={currentLocale}
      showOutsideDays={showOutsideDays}
      fixedWeeks
      numberOfMonths={numberOfMonths}
      className={cn("p-2 sm:p-4 relative bg-background", className)}
      formatters={{
        formatCaption: (date, options) => {
          return format(date, "MMMM yyyy", { locale: options?.locale });
        },
      }}
      classNames={{
        months: "flex flex-col sm:flex-row items-start justify-center gap-10",
        month: "space-y-4 w-full",
        // @ts-ignore
        month_caption:
          "flex justify-center items-center h-8 relative gap-1 mb-1 px-12",
        caption_label:
          "text-foreground font-bold tracking-tight text-sm sm:text-base",
        nav: "flex items-center justify-between absolute top-2 sm:top-4 left-1.5 right-1.5 w-[calc(100%-12px)] z-10 pointer-events-none",
        button_previous: cn(
          "h-8 w-8 bg-background border border-border shadow-sm rounded-full flex items-center justify-center text-foreground/70 hover:bg-brand-red/10 hover:text-brand-red transition-all active:scale-95 enabled:pointer-events-auto disabled:pointer-events-none disabled:opacity-20 disabled:cursor-not-allowed enabled:cursor-pointer",
        ),
        button_next: cn(
          "h-8 w-8 bg-background border border-border shadow-sm rounded-full flex items-center justify-center text-foreground/70 hover:bg-brand-red/10 hover:text-brand-red transition-all active:scale-95 enabled:pointer-events-auto disabled:pointer-events-none disabled:opacity-20 disabled:cursor-not-allowed enabled:cursor-pointer",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "grid grid-cols-7 w-full mb-1",
        weekday:
          "text-muted-foreground dark:text-blue-200/70 w-full h-8 text-[11px] font-semibold text-center flex items-center justify-center",
        week: "grid grid-cols-7 w-full",
        // @ts-ignore
        cell: cn(
          "w-full h-8 sm:h-9 flex items-center justify-center text-center p-0 relative focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-ezee-red/15"
            : "[&:has([aria-selected])]:bg-transparent",
        ),
        // @ts-ignore
        day_button: cn(
          "w-8 h-8 sm:w-9 sm:h-9 p-0 text-foreground dark:text-foreground/90 font-medium rounded-full hover:bg-brand-red/10 hover:text-redmix dark:hover:text-white transition-colors flex items-center justify-center text-sm cursor-pointer",
        ),
        // @ts-ignore
        range_end: "day-range-end",
        selected:
          "bg-redmix !text-white font-bold shadow-md rounded-full hover:bg-redmix hover:!text-white focus:bg-redmix focus:!text-white [&_button]:!text-white [&_button]:hover:!text-white [&_button]:focus:!text-white",
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
        caption_dropdowns:
          "flex flex-col-reverse justify-center items-center gap-2 ",
        dropdowns:
          "flex flex-col-reverse justify-center items-center md:gap-1 gap-0 hover:bg-card pt-2",
        dropdown:
          "bg-muted/50 hover:bg-muted px-2 py-1 rounded-md border-none text-sm font-bold focus:ring-2 focus:ring-redmix/20 cursor-pointer appearance-none transition-colors",
        dropdown_month: "relative inline-flex items-center",
        dropdown_year: "relative inline-flex items-center",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left")
            return <ChevronLeft className="h-4 w-4" />;
          return <ChevronRight className="h-4 w-4" />;
        },
        Dropdown: ({ value, onChange, options, ...props }: DropdownProps) => {
          const [open, setOpen] = React.useState(false);
          const isMonth = options?.length === 12;
          const triggerWidth = isMonth ? "w-[120px]" : "w-[100px]";

          const displayOptions = React.useMemo(() => {
            if (!options) return [];
            if (isMonth) return options;
            return [...options].sort(
              (a, b) => Number(b.value) - Number(a.value),
            );
          }, [options, isMonth]);

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center justify-between h-8 bg-muted/50 hover:bg-muted border-none font-bold text-xs rounded-md px-3 gap-1 focus:outline-none focus:ring-2 focus:ring-redmix/20 cursor-pointer shadow-none transition-all duration-200",
                    triggerWidth,
                  )}
                >
                  <span>
                    {options?.find(
                      (opt) => opt.value.toString() === value?.toString(),
                    )?.label || value}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[140px] p-1 max-h-[300px] overflow-hidden bg-popover border border-border rounded-xl shadow-xl z-[200]"
                align="start"
              >
                <ScrollArea className="h-[250px] pr-1">
                  <div className="flex flex-col gap-0.5">
                    {displayOptions.map((option) => {
                      const isSelected =
                        option.value.toString() === value?.toString();
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            const changeEvent = {
                              target: { value: option.value.toString() },
                            } as React.ChangeEvent<HTMLSelectElement>;
                            onChange?.(changeEvent);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex w-full cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-xs font-medium outline-none transition-colors text-left",
                            isSelected
                              ? "bg-redmix text-white font-bold"
                              : "text-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
