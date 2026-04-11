"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { MapPin, Plane, Building, X, LucideIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  type: string;
  code: string;
  name: string;
  detail: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: "1",
    type: "airport",
    code: "LHE",
    name: "Lahore",
    detail: "Allama Iqbal Intl (LHE)",
  },
  {
    id: "2",
    type: "airport",
    code: "DXB",
    name: "Dubai",
    detail: "Dubai Intl (DXB)",
  },
  {
    id: "3",
    type: "airport",
    code: "JFK",
    name: "New York",
    detail: "John F Kennedy Intl (JFK)",
  },
  {
    id: "4",
    type: "city",
    code: "LON",
    name: "London",
    detail: "United Kingdom (LON)",
  },
  {
    id: "5",
    type: "airport",
    code: "LHR",
    name: "London",
    detail: "Heathrow (LHR)",
  },
];

interface LocationInputProps {
  id?: string;
  label?: string | null;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  icon?: LucideIcon;
  className?: string;
  shimmer?: boolean;
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
}: LocationInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  // Sync internal state with prop value for controlled behavior
  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setOpen(true);
          }}
          onMouseLeave={() => {
            timeoutRef.current = setTimeout(() => {
              setOpen(false);
            }, 150);
          }}
        >
          <div className="relative z-10 flex flex-col flex-1 min-w-0">
            {inputValue && (
              <span className="text-[10px] font-semibold text-brand-red capitalize leading-none mb-0.5 tracking-tight animate-in slide-in-from-bottom-1 fade-in duration-200">
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
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-foreground/60 placeholder:font-medium"
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

          {shimmer && <div className="shimmer-effect" />}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className="w-[var(--radix-popover-trigger-width)] bg-background border border-border shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-md overflow-hidden z-50"
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
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={() => {
            timeoutRef.current = setTimeout(() => {
              setOpen(false);
            }, 150);
          }}
        >
          <div className="p-2 bg-muted/30 border-b border-border">
            <span className="text-xs font-medium text-foreground/80 px-1">
              {inputValue ? "Search Results" : "Recent or Popular"}
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto no-scrollbar">
            {(() => {
              const filtered = SUGGESTIONS.filter((s) => {
                if (!inputValue) return true;
                const search = inputValue.toLowerCase();
                return (
                  s.name.toLowerCase().includes(search) ||
                  s.code.toLowerCase().includes(search) ||
                  s.detail.toLowerCase().includes(search)
                );
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-5 text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-foreground/20" />
                    </div>
                    <p className="text-sm font-medium text-foreground/60">
                      No results found for
                    </p>
                    <p className="text-xs font-medium text-foreground/60 truncate">
                      {inputValue}
                    </p>
                    <p className="text-xs text-foreground/40 mt-1">
                      Try searching for a different city or airport code
                    </p>
                  </div>
                );
              }

              return filtered.map((s) => (
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
                  {/* <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-full mr-3 group-hover/item:bg-brand-red/10 transition-colors">
                    {s.type === "airport" ? (
                      <Plane className="w-4 h-4 text-foreground/60 group-hover/item:text-brand-red" />
                    ) : (
                      <Building className="w-4 h-4 text-foreground/60 group-hover/item:text-brand-red" />
                    )}
                  </div> */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-foreground text-sm truncate">
                      {s.name}
                    </span>
                    <span className="text-xs text-foreground/50 truncate font-normal">
                      {s.detail}
                    </span>
                  </div>
                  <span className="ml-3 font-medium text-[10px] text-foreground/30 capitalize tracking-wider">
                    {s.code}
                  </span>
                </button>
              ));
            })()}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
