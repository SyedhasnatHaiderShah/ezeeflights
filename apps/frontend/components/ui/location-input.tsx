"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { MapPin, Plane, Building, X, LucideIcon, Search, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchAirports, getPopularAirports, Airport } from "@/lib/utils/airport-search";

interface Suggestion {
  id: string;
  type: string;
  code: string;
  name: string;
  detail: string;
}

interface LocationInputProps {
  id?: string;
  label?: string | null;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  icon?: LucideIcon;
  className?: string;
  shimmer?: boolean;
  glassPopover?: boolean;
  openOnHover?: boolean;
}

export function LocationInput({
  id,
  label,
  placeholder = "Where to?",
  value,
  onChange,
  icon: Icon = MapPin,
  className,
  shimmer = true,
  glassPopover = false,
  openOnHover = true,
}: LocationInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [popularAirports, setPopularAirports] = React.useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Sync internal state with prop value for controlled behavior
  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Load popular airports on mount
  React.useEffect(() => {
    const loadPopular = async () => {
      try {
        const popular = await getPopularAirports();
        const mapped = popular.map(a => ({
          id: a.id,
          type: a.type,
          code: a.iata_code,
          name: a.name,
          detail: `${a.municipality ? a.municipality + ', ' : ''}${a.country_name}`
        }));
        setPopularAirports(mapped);
        if (!inputValue) {
          setSuggestions(mapped);
        }
      } catch (err) {
        console.error("Failed to load popular airports", err);
      }
    };
    loadPopular();
  }, []);

  const handleSelect = (suggestion: Suggestion) => {
    const newValue = suggestion.code;
    setInputValue(newValue);
    onChange?.(newValue);

    // Force close the popover
    setOpen(false);

    // Blur the input to remove focus
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue("");
    onChange?.("");
    // Focus and reopen dropdown for better UX
    if (inputRef.current) {
      inputRef.current.focus();
      setOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange?.(val);

    // Open dropdown when user types
    setOpen(true);

    // Debounced search
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (val.trim().length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchAirports(val);
          const mapped: Suggestion[] = results.map(a => ({
            id: a.id,
            type: a.type,
            code: a.iata_code || a.gps_code || a.ident,
            name: a.name,
            detail: `${a.municipality ? a.municipality + ', ' : ''}${a.country_name}`
          }));
          setSuggestions(mapped);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else if (val.trim().length === 0) {
      setSuggestions(popularAirports);
      setIsSearching(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div
          className={cn(
            "relative flex items-center w-full bg-transparent hover:bg-brand-red/5 transition-colors cursor-text px-3 group overflow-hidden h-full focus-visible:outline-none",
            open && "bg-brand-red/5 z-10",
            className,
          )}
          onClick={() => {
            // Focus the input when clicking anywhere in the container
            if (inputRef.current) {
              inputRef.current.focus();
              setOpen(true);
            }
          }}
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
          <div className="relative z-10 flex flex-col flex-1 min-w-0">
            {inputValue && (
              <span
                className={cn(
                  "text-[10px] font-semibold capitalize leading-none mb-0.5 tracking-tight animate-in slide-in-from-bottom-1 fade-in duration-200",
                  glassPopover ? "text-white/70" : "text-foreground/70",
                )}
              >
                {placeholder}
              </span>
            )}
              <input
                ref={inputRef}
                id={id}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                  setOpen(true);
                }}
                onBlur={() => {
                  // Use timeout to allow click events on dropdown items to fire first
                  timeoutRef.current = setTimeout(() => {
                    setOpen(false);
                  }, 150);
                }}
                placeholder={placeholder}
                className={cn(
                  "w-full bg-transparent border-none outline-none text-sm font-medium placeholder:font-medium",
                  glassPopover
                    ? "text-white placeholder:text-white/60"
                    : "text-foreground placeholder:text-foreground/60",
                )}
                autoComplete="off"
              />
          </div>
          {inputValue && (
            <button
              onClick={handleClear}
              className="relative z-10 p-1 hover:bg-brand-gray rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <X className="w-3 h-3 text-foreground/40" />
            </button>
          )}

          <ChevronDown
            className={cn(
              "ml-1 h-3.5 w-3.5 shrink-0 transition-transform duration-300 relative z-10",
              glassPopover ? "text-white/60" : "text-foreground/40",
              open && "rotate-180",
            )}
          />

          {shimmer && <div className="shimmer-effect" />}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className={cn(
            "z-50 w-(--radix-popover-trigger-width) overflow-hidden rounded-md border shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]",
            glassPopover
              ? "border-white/20 bg-white/10 text-white backdrop-blur-2xl"
              : "border-border bg-background text-foreground",
          )}
          sideOffset={0}
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => {
            // Close when clicking outside
            setOpen(false);
          }}
          onEscapeKeyDown={() => setOpen(false)}
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
          <div
            className={cn(
              "border-b p-2",
              glassPopover
                ? "border-white/15 bg-white/5"
                : "border-border bg-muted/30",
            )}
          >
            <span
              className={cn(
                "text-xs font-medium px-1",
                glassPopover ? "text-white/80" : "text-foreground/80",
              )}
            >
              {inputValue ? "Search Results" : "Recent or Popular"}
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {isSearching ? (
              <div className="p-10 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-brand-red" />
                <p className="text-xs font-medium">Searching airports...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-5 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-foreground/20" />
                </div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    glassPopover ? "text-white/60" : "text-foreground/60",
                  )}
                >
                  No results found for
                </p>
                <p
                  className={cn(
                    "text-xs font-medium truncate",
                    glassPopover ? "text-white/60" : "text-foreground/60",
                  )}
                >
                  {inputValue}
                </p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    glassPopover ? "text-white/40" : "text-foreground/40",
                  )}
                >
                  Try searching for a different city or airport code
                </p>
              </div>
            ) : (
              suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className="flex items-center w-full p-2.5 hover:bg-brand-red/5 transition-colors text-left border-b border-border/40 last:border-0 group/item"
                  type="button"
                  onMouseDown={(e) => {
                    // Prevent blur from firing before click
                    e.preventDefault();
                  }}
                >
                  <div className="flex flex-col flex-1 min-w-0">
                    <span
                      className={cn(
                        "font-medium text-sm truncate",
                        glassPopover ? "text-white" : "text-foreground",
                      )}
                    >
                      {s.name}
                    </span>
                    <span
                      className={cn(
                        "text-xs truncate font-normal",
                        glassPopover ? "text-white/80" : "text-foreground/80",
                      )}
                    >
                      {s.detail}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "ml-3 font-medium text-[10px] capitalize tracking-wider px-1.5 py-0.5 rounded bg-muted/50 border border-border/50",
                      glassPopover ? "text-white/90 bg-white/10" : "text-foreground/70",
                    )}
                  >
                    {s.code}
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
