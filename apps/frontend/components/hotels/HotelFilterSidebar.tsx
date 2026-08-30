"use client";

import React from "react";
import { ChevronRight, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export const HOTEL_SORT_OPTIONS = [
  "Recommended",
  "Price",
  "Rating",
  "Distance",
] as const;

export type HotelSortOption = (typeof HOTEL_SORT_OPTIONS)[number];

interface FilterProps {
  maxPrice: number;
  onPriceChange: (val: number) => void;
  selectedStars: number[];
  onStarsChange: (val: number[]) => void;
  sortBy?: HotelSortOption;
  onSortChange?: (val: HotelSortOption) => void;
  resultsCount?: number;
  stayDays?: number;
  minPossiblePrice?: number;
  maxPossiblePrice?: number;
  priceStep?: number;
  onClose?: () => void;
  hasRatings?: boolean;
}

const GROUP_SURFACE_CLASS =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50";

const sectionLabel = "px-1 text-[13px] font-semibold text-foreground/80 mb-1.5";

const accordionItemClass =
  "border-0 mb-2.5 last:mb-0 hover:border-transparent data-[state=open]:bg-transparent data-[state=open]:border-transparent";

const accordionTriggerClass =
  "!py-2 min-h-[38px] px-1 text-[15px] font-medium text-foreground tracking-normal hover:no-underline [&[data-state=open]]:text-foreground [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:justify-between [&>span]:gap-2 [&>div]:hidden";

const accordionContentClass =
  "!pb-0 !pt-1.5 px-0 text-foreground [&_.accordion-content-inner]:!p-0 [&_.accordion-content-inner]:!pb-0";

function FilterGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(GROUP_SURFACE_CLASS, "divide-y divide-border/50")}>
      {children}
    </div>
  );
}

function FilterRow({
  label,
  meta,
  checked,
  onToggle,
  leading,
}: {
  label: React.ReactNode;
  meta?: React.ReactNode;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  leading?: React.ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(!checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(!checked);
        }
      }}
      className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left active:bg-foreground/5 transition-colors"
    >
      <span className="flex min-w-0 items-center gap-2">
        {leading}
        <span className="truncate text-[14px] font-normal text-foreground leading-tight">
          {label}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {meta}
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            checked
              ? "border-redmix bg-redmix text-white"
              : "border-foreground/25 bg-white dark:bg-card",
          )}
        >
          {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
        </span>
      </span>
    </div>
  );
}

function PanelCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(GROUP_SURFACE_CLASS, "px-3 py-2.5")}>{children}</div>
  );
}

export function HotelFilterSidebar({
  maxPrice,
  onPriceChange,
  selectedStars,
  onStarsChange,
  sortBy = "Recommended",
  onSortChange,
  resultsCount,
  stayDays = 1,
  minPossiblePrice = 50,
  maxPossiblePrice = 1000,
  priceStep,
  onClose,
  hasRatings = true,
}: FilterProps) {
  const { t } = useTranslation();
  const sliderStep = priceStep ?? Math.max(10 * stayDays, 1);

  const toggleStar = (star: number) => {
    if (selectedStars.includes(star)) {
      onStarsChange(selectedStars.filter((s) => s !== star));
    } else {
      onStarsChange([...selectedStars, star]);
    }
    onClose?.();
  };

  const minSlider = minPossiblePrice;
  const maxSlider = maxPossiblePrice;

  return (
    <aside className="w-full bg-transparent px-2 pb-4">
      {onSortChange && (
        <div className="mb-3 md:hidden">
          <p className={sectionLabel}>{t("Sort By")}</p>
          <div className="grid grid-cols-2 gap-0.5 rounded-[10px] bg-muted/60 p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
            {HOTEL_SORT_OPTIONS.filter((sort) => sort !== "Rating" || hasRatings).map((sort) => (
              <button
                key={sort}
                type="button"
                onClick={() => {
                  onSortChange(sort);
                  onClose?.();
                }}
                className={cn(
                  "rounded-[8px] px-2 py-2 text-[11px] font-semibold transition-all duration-150",
                  sortBy === sort
                    ? "bg-white dark:bg-card text-redmix shadow-sm"
                    : "text-foreground/80 active:bg-white/70",
                )}
              >
                {t(sort)}
              </button>
            ))}
          </div>
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={["price", "stars"]}
        className="space-y-0.5"
      >
        <AccordionItem value="price" className={accordionItemClass}>
          <AccordionTrigger className={accordionTriggerClass}>
            {t("Total Budget")}
            <ChevronRight className="h-4 w-4 shrink-0 text-foreground/35 transition-transform group-data-[state=open]:rotate-90" />
          </AccordionTrigger>
          <AccordionContent className={accordionContentClass}>
            <PanelCard>
              <div className="text-xs font-semibold text-foreground mb-1.5 leading-tight">
                {t("Up to")}{" "}
                <CurrencyDisplay
                  amount={maxPrice}
                  currency="USD"
                  showComparison={false}
                  className="inline-block"
                  amountClassName="text-sm font-semibold"
                />
              </div>
              <Slider
                variant="ios"
                value={[Math.min(maxPrice, maxSlider)]}
                onValueChange={(val) => onPriceChange(val[0])}
                onValueCommit={() => onClose?.()}
                min={minSlider}
                max={maxSlider}
                step={sliderStep}
              />
              <div className="mt-2 flex justify-between text-xs font-medium text-foreground">
                <CurrencyDisplay
                  amount={minSlider}
                  currency="USD"
                  showComparison={false}
                  className="gap-0"
                  amountClassName="text-xs font-semibold"
                />
                <span className="flex items-center gap-0.5">
                  <CurrencyDisplay
                    amount={maxSlider}
                    currency="USD"
                    showComparison={false}
                    className="gap-0"
                    amountClassName="text-xs font-semibold"
                  />
                  <span>+</span>
                </span>
              </div>
            </PanelCard>
          </AccordionContent>
        </AccordionItem>

        {hasRatings && (
          <AccordionItem value="stars" className={accordionItemClass}>
            <AccordionTrigger className={accordionTriggerClass}>
              <span className="flex items-center gap-2">
                {t("Star Rating")}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-foreground transition-transform group-data-[state=open]:rotate-90" />
            </AccordionTrigger>
            <AccordionContent className={accordionContentClass}>
              <FilterGroup>
                {[5, 4, 3, 2, 1].map((star) => (
                  <FilterRow
                    key={star}
                    label={
                      <>
                        <span className=" text-foreground text-xs font-semibold">
                          {star} {star === 1 ? t("Star") : t("Stars")}
                        </span>
                      </>
                    }
                    meta={
                      <span className="text-amber-500 text-[12px] tracking-tight">
                        {"★".repeat(star)}
                      </span>
                    }
                    checked={selectedStars.includes(star)}
                    onToggle={() => toggleStar(star)}
                  />
                ))}
              </FilterGroup>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      <div className="mt-2.5 pt-3 border-t border-border/50 flex flex-col items-center gap-2">
        {/* {resultsCount !== undefined && (
          <span className="rounded-full border border-border/50 bg-white dark:bg-card px-3 py-1 text-[12px] font-medium text-foreground/80">
            {resultsCount} {t("results")}
          </span>
        )} */}
        <button
          type="button"
          onClick={() => {
            onPriceChange(maxSlider);
            onStarsChange([]);
            onSortChange?.("Recommended");
            onClose?.();
          }}
          className="text-[14px] text-redmix font-medium active:opacity-60"
        >
          {t("Reset all filters")}
        </button>
      </div>
    </aside>
  );
}
