"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NATIONALITIES, resolveNationalitySelectValue } from "@/lib/countries";
import { useTranslation } from "react-i18next";

interface NationalitySelectProps {
  value?: string;
  onChange: (countryName: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function NationalitySelect({
  value,
  onChange,
  disabled = false,
  placeholder = "Select country (optional)",
  className,
}: NationalitySelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedName = resolveNationalitySelectValue(value);
  const selected = NATIONALITIES.find((c) => c.name === selectedName);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return NATIONALITIES;
    return NATIONALITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.alpha2.toLowerCase().includes(q) ||
        c.alpha3.toLowerCase().includes(q) ||
        c.nationality.toLowerCase().includes(q),
    );
  }, [searchTerm]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearchTerm("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-lg border border-input bg-background px-3 font-semibold text-xs hover:bg-background",
            !selectedName && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected ? (
              <>
                <span className="inline-block md:hidden">{selected.flag}</span>
                <span className="truncate text-foreground text-xs font-semibold">
                  {t(selected.name)}
                </span>
              </>
            ) : (
              <span className="truncate text-xs text-muted-foreground">{t(placeholder)}</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-md z-[9999]"
        align="start"
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <Search className="h-4 w-4 text-foreground/80 shrink-0" />
          <input
            type="text"
            placeholder={t("Search nationality or country...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground text-foreground"
            autoFocus
          />
        </div>
        <div className="max-h-[250px] overflow-y-auto p-1 text-sm">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
              setSearchTerm("");
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-lg p-2.5 text-left hover:bg-muted transition-colors",
              !selectedName && "bg-muted font-bold",
            )}
          >
            <span className="text-foreground/90">— {t("None")} —</span>
            {!selectedName && (
              <Check className="h-4 w-4 text-redmix shrink-0" />
            )}
          </button>
          {filtered.map((country) => {
            const isSelected = country.name === selectedName;
            return (
              <button
                key={country.alpha2}
                type="button"
                onClick={() => {
                  onChange(country.name);
                  setOpen(false);
                  setSearchTerm("");
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg p-2.5 text-left hover:bg-muted transition-colors",
                  isSelected && "bg-muted font-bold",
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="inline-block md:hidden">{country.flag}</span>
                  <span className="truncate font-semibold text-xs text-foreground">
                    {t(country.name)}
                  </span>
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-foreground/80">
                    {country.alpha2}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-redmix shrink-0" />
                  )}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-3 text-center text-xs text-muted-foreground">
              {t("No countries found.")}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
