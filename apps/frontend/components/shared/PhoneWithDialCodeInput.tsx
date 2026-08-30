"use client";

import { useState, useEffect } from "react";
import { Phone, Search, Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";
import {
  buildFullPhone,
  normalizePhoneInput,
  parseDialCodePhone,
} from "@/lib/phone";
import { useTranslation } from "react-i18next";
import { fetchClientGeo } from "@/lib/currency/client-geo";
import { useCurrencyStore } from "@/lib/store/currency-store";

interface PhoneWithDialCodeInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  id?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  /** `guest` matches hotel booking field styling */
  variant?: "default" | "guest";
  className?: string;
  hasError?: boolean;
}

export function PhoneWithDialCodeInput({
  value,
  onChange,
  id,
  required,
  placeholder,
  disabled = false,
  variant = "default",
  className,
  hasError = false,
}: PhoneWithDialCodeInputProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const { countryCode: parsedCountryCode, phoneInput: parentPhoneInput } =
    parseDialCodePhone(value);
  const [localPhoneInput, setLocalPhoneInput] = useState(parentPhoneInput);
  const [geoDialCode, setGeoDialCode] = useState("+1");
  const geoLocation = useCurrencyStore((state) => state.geoLocation);

  useEffect(() => {
    const code = geoLocation?.countryCode;
    if (code) {
      const match = COUNTRIES.find(
        (c) => c.label.toUpperCase() === code.toUpperCase(),
      );
      if (match) {
        setGeoDialCode(match.value);
        return;
      }
    }

    async function loadGeo() {
      try {
        const geo = await fetchClientGeo();
        const code = geo?.countryCode;
        if (code) {
          const match = COUNTRIES.find(
            (c) => c.label.toUpperCase() === code.toUpperCase(),
          );
          if (match) {
            setGeoDialCode(match.value);
          }
        }
      } catch (err) {
        // Fallback silently
      }
    }
    loadGeo();
  }, [geoLocation]);

  const hasDialCode = value?.trim().startsWith("+");
  const countryCode = hasDialCode ? parsedCountryCode : geoDialCode;

  useEffect(() => {
    setLocalPhoneInput(parentPhoneInput);
  }, [parentPhoneInput]);
  const isGuest = variant === "guest";
  const defaultPlaceholder = t("3001234567");

  const handleCountryCodeChange = (newCode: string) => {
    onChange(buildFullPhone(newCode, localPhoneInput));
  };

  const handleInputChange = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      onChange("");
      return;
    }
    if (trimmed.startsWith("+")) {
      onChange(normalizePhoneInput(trimmed));
      return;
    }
    onChange(buildFullPhone(countryCode, trimmed));
  };

  const cleanSearchNum = searchTerm.replace(/\D/g, "");
  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.value.includes(searchTerm) ||
      c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cleanSearchNum !== "" &&
        c.value.replace("+", "").includes(cleanSearchNum)),
  ).sort((a, b) => {
    const term = searchTerm.toLowerCase();
    const aLabel = a.label.toLowerCase();
    const bLabel = b.label.toLowerCase();
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    // 1. Exact label match (e.g. 'us' -> 'US')
    if (aLabel === term && bLabel !== term) return -1;
    if (bLabel === term && aLabel !== term) return 1;

    // 2. Exact name match
    if (aName === term && bName !== term) return -1;
    if (bName === term && aName !== term) return 1;

    // 3. Name starts with term
    const aStartsName = aName.startsWith(term);
    const bStartsName = bName.startsWith(term);
    if (aStartsName && !bStartsName) return -1;
    if (bStartsName && !aStartsName) return 1;

    // 4. Label starts with term
    const aStartsLabel = aLabel.startsWith(term);
    const bStartsLabel = bLabel.startsWith(term);
    if (aStartsLabel && !bStartsLabel) return -1;
    if (bStartsLabel && !aStartsLabel) return 1;

    return a.name.localeCompare(b.name);
  });

  const selectedCountry = COUNTRIES.find((c) => c.value === countryCode);

  return (
    <div
      className={cn(
        "flex min-w-0 items-stretch overflow-hidden border bg-background transition-all focus-within:ring-2 disabled:opacity-60",
        isGuest
          ? "h-[50px] rounded-2xl border-border/50 bg-muted/20 focus-within:ring-redmix/20 focus-within:border-redmix focus-within:bg-background"
          : "h-11 rounded-xl border-input focus-within:ring-ring/30 focus-within:border-primary/50",
        hasError && "border-red-500 dark:border-red-500 focus-within:ring-red-500/30 focus-within:border-red-500",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <Phone
        className={cn(
          "pointer-events-none shrink-0 self-center text-foreground",
          isGuest ? "ml-4 h-4 w-4" : "ml-3 h-4 w-4",
        )}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex shrink-0 items-center gap-1 border-r border-border/60 bg-transparent px-2 text-foreground outline-none hover:bg-muted/40 focus-visible:bg-muted/40 select-none",
              isGuest ? "h-full py-0 pl-2 pr-2" : "h-full py-0 pl-1.5 pr-2",
            )}
          >
            {/* <span className="text-base leading-none">
              {selectedCountry?.flag || "🌍"}
            </span> */}
            <span className="text-sm font-semibold tabular-nums md:text-xs">
              {countryCode}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[300px] p-0 rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-md z-[9999]"
          align="start"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder={t("Search country or code...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground text-foreground"
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto p-1 text-sm">
            {filteredCountries.map((c, idx) => {
              const isSelected = c.value === countryCode;
              return (
                <div
                  key={`${c.label}-${c.value}-${idx}`}
                  onClick={() => {
                    handleCountryCodeChange(c.value);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                  className={cn(
                    "flex items-center justify-between p-2.5 cursor-pointer rounded-lg hover:bg-muted select-none transition-colors",
                    isSelected && "bg-muted font-bold",
                  )}
                >
                  <span className="flex items-center gap-2 truncate flex-1">
                    <span>{c.flag}</span>
                    <span className="truncate font-semibold text-xs">
                      {c.name}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">
                      {c.value}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-redmix shrink-0" />
                    )}
                  </span>
                </div>
              );
            })}
            {filteredCountries.length === 0 && (
              <div className="p-3 text-center text-xs text-muted-foreground select-none">
                {t("No results found.")}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={required}
        disabled={disabled}
        value={localPhoneInput}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, ""); // Keep only numbers
          setLocalPhoneInput(val);
        }}
        onBlur={() => {
          if (localPhoneInput !== parentPhoneInput) {
            handleInputChange(localPhoneInput);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold tabular-nums outline-none placeholder:text-muted-foreground md:text-xs",
          isGuest ? "h-full px-3" : "h-full px-3",
        )}
        placeholder={placeholder ?? defaultPlaceholder}
        aria-label={t("Phone number")}
      />
    </div>
  );
}
