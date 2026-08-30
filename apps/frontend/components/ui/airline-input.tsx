"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Plane, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatAirlineDisplay,
  getAirlineByCode,
  getPopularAirlines,
  searchAirlines,
  type AirlineCatalogEntry,
} from "@/lib/utils/airline-names";

interface AirlineInputProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  allowAny?: boolean;
  disabled?: boolean;
}

export function AirlineInput({
  id,
  placeholder = "Select airline",
  value,
  onChange,
  className,
  allowAny = true,
  disabled = false,
}: AirlineInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const [selectedLabel, setSelectedLabel] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<AirlineCatalogEntry[]>(
    [],
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const blurTimeoutRef = React.useRef<NodeJS.Timeout>();
  const inputValueRef = React.useRef(inputValue);
  const isEditingRef = React.useRef(isEditing);

  inputValueRef.current = inputValue;
  isEditingRef.current = isEditing;

  React.useEffect(() => {
    if (isEditing) return;
    const trimmed = (value || "").trim();
    if (!trimmed) {
      setInputValue("");
      setSelectedLabel(allowAny ? "Any airline" : null);
      return;
    }

    const entry = getAirlineByCode(trimmed);
    setInputValue(trimmed.toUpperCase());
    setSelectedLabel(entry ? formatAirlineDisplay(entry) : trimmed.toUpperCase());
  }, [value, isEditing, allowAny]);

  React.useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length >= 1) {
      setSuggestions(searchAirlines(trimmed));
    } else {
      setSuggestions(getPopularAirlines());
    }
  }, [inputValue]);

  const handleSelect = (entry: AirlineCatalogEntry | null) => {
    if (!entry) {
      setInputValue("");
      setSelectedLabel(allowAny ? "Any airline" : null);
      setIsEditing(false);
      onChange?.("");
    } else {
      const code = entry.iata.toUpperCase();
      setInputValue(code);
      setSelectedLabel(formatAirlineDisplay(entry));
      setIsEditing(false);
      onChange?.(code);
    }
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setSelectedLabel(null);
    setIsEditing(true);
    onChange?.(val.toUpperCase());
    setOpen(true);
  };

  const shownValue = isEditing ? inputValue : (selectedLabel ?? inputValue);

  const finalizeOnBlur = () => {
    if (!isEditingRef.current) return;

    const trimmed = inputValueRef.current.trim();
    if (!trimmed) {
      setSelectedLabel(allowAny ? "Any airline" : null);
      setIsEditing(false);
      onChange?.("");
      return;
    }

    if (trimmed.length <= 3) {
      const code = trimmed.toUpperCase();
      const entry = getAirlineByCode(code);
      setInputValue(code);
      setSelectedLabel(entry ? formatAirlineDisplay(entry) : code);
      setIsEditing(false);
      onChange?.(code);
      return;
    }

    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  return (
    <Popover.Root open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Anchor asChild>
        <div
          className={cn(
            "relative flex items-center w-full transition-colors cursor-text px-3 group overflow-hidden h-full",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            className,
          )}
          onClick={() => {
            if (disabled) return;
            inputRef.current?.focus();
            setOpen(true);
          }}
        >
          <Plane className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="relative z-10 flex flex-col flex-1 min-w-0">
            {(shownValue || inputValue) && (
              <span className="text-[10px] font-semibold capitalize leading-none mb-0.5 tracking-tight text-muted-foreground">
                {placeholder}
              </span>
            )}
            <input
              ref={inputRef}
              id={id}
              type="text"
              value={shownValue}
              onChange={handleInputChange}
              disabled={disabled}
              onFocus={() => {
                if (disabled) return;
                setIsEditing(true);
                if (selectedLabel) setInputValue("");
                setOpen(true);
              }}
              onBlur={() => {
                if (disabled) return;
                blurTimeoutRef.current = setTimeout(() => {
                  setOpen(false);
                  finalizeOnBlur();
                }, 150);
              }}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "Enter") {
                  finalizeOnBlur();
                  setOpen(false);
                  inputRef.current?.blur();
                }
              }}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder:font-medium truncate text-foreground placeholder:text-muted-foreground"
              autoComplete="off"
              title={selectedLabel ?? inputValue}
            />
          </div>
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className="z-[200] w-[var(--radix-popover-trigger-width)] min-w-[280px] overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl text-foreground shadow-xl"
          sideOffset={4}
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="border-b border-border bg-muted/40 p-2">
            <span className="text-xs font-medium px-1 text-muted-foreground">
              {inputValue ? "Search Results" : "Popular Airlines"}
            </span>
          </div>
          <div
            className="max-h-[240px] overflow-y-auto no-scrollbar"
            onPointerDown={(e) => e.preventDefault()}
          >
            {allowAny && !inputValue.trim() && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="flex items-center w-full p-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border/40"
              >
                <span className="font-medium text-sm text-muted-foreground">
                  Any airline (wildcard)
                </span>
              </button>
            )}
            {suggestions.length === 0 ? (
              <div className="p-5 text-center">
                <Search className="mx-auto mb-2 h-5 w-5 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">
                  No airlines found
                </p>
              </div>
            ) : (
              suggestions.map((entry) => (
                <button
                  key={entry.iata}
                  type="button"
                  onClick={() => handleSelect(entry)}
                  className="flex items-center w-full p-2.5 hover:bg-muted/60 transition-colors text-left border-b border-border/40 last:border-0"
                >
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">
                      {entry.name}
                    </span>
                  </div>
                  <span className="ml-3 font-semibold text-[10px] tracking-wider px-1.5 py-0.5 rounded-md bg-muted border border-border/50 text-foreground/80">
                    {entry.iata.toUpperCase()}
                  </span>
                </button>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
