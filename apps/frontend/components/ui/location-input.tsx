"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  MapPin,
  Building,
  X,
  LucideIcon,
  Search,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  searchAirports,
  getPopularAirports,
  getAirportByCode,
  fetchAirports,
  Airport,
} from "@/lib/utils/airport-search";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useLocalRecentSearches } from "@/lib/api/search";

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
  disabled?: boolean;
  mode?: "flights" | "hotels" | "cars";
}

function formatAirportDisplay(airport: Airport): string {
  const code = airport.iata_code?.toUpperCase() || airport.gps_code || "";
  const city = airport.municipality?.trim() || airport.name;
  if (city && code) return `${city} (${code})`;
  if (code) return `(${code})`;
  return city;
}

function formatSuggestionDisplay(s: Suggestion, mode?: string): string {
  if (mode === "hotels" || mode === "cars") {
    return s.name;
  }
  const code = s.code?.toUpperCase() || "";
  // For flights mode, return s.name (the city name or airport name) and code
  if (code) return `${s.name} (${code})`;
  return s.name;
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
  disabled = false,
  mode = "flights",
}: LocationInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const [selectedLabel, setSelectedLabel] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [popularAirports, setPopularAirports] = React.useState<Suggestion[]>(
    [],
  );
  const [recentAirports, setRecentAirports] = React.useState<Suggestion[]>([]);

  const session = useAuthSession();
  const isLoggedIn = Boolean(session.data);
  const { data: rawData = [] } = useLocalRecentSearches();
  const rawRecentData = rawData;
  const [isSearching, setIsSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  // After your existing state declarations, add:
  const inputValueRef = React.useRef(inputValue);
  const isEditingRef = React.useRef(isEditing);

  // Keep them in sync on every render
  inputValueRef.current = inputValue;
  isEditingRef.current = isEditing;

  // Sync code from parent; resolve full city label for 3-letter airport codes
  React.useEffect(() => {
    if (isEditing) return;
    const trimmed = (value || "").trim();
    if (!trimmed) {
      setInputValue("");
      setSelectedLabel(null);
      return;
    }

    if (trimmed.length === 3) {
      setInputValue(trimmed.toUpperCase());
      let cancelled = false;
      getAirportByCode(trimmed).then(async (airport) => {
        if (cancelled) return;
        if (airport) {
          if (mode === "hotels" || mode === "cars") {
            setSelectedLabel(airport.municipality || airport.name);
          } else {
            setSelectedLabel(formatAirportDisplay(airport));
          }
        } else {
          try {
            const airports = await fetchAirports();
            const lowerCode = trimmed.toLowerCase();
            const metroMatch = airports.find((a) => {
              if (!a.keywords) return false;
              const words = a.keywords.toLowerCase().split(/[\s,.-]+/);
              return words.includes(lowerCode);
            });
            if (metroMatch) {
              if (mode === "hotels" || mode === "cars") {
                setSelectedLabel(metroMatch.municipality);
              } else {
                setSelectedLabel(
                  `${metroMatch.municipality}, ${metroMatch.country_name} (${trimmed.toUpperCase()})`,
                );
              }
            } else {
              setSelectedLabel(null);
            }
          } catch (err) {
            setSelectedLabel(null);
          }
        }
      });
      return () => {
        cancelled = true;
      };
    }

    setSelectedLabel(null);
    setInputValue(trimmed);
  }, [value, isEditing, mode]);

  // Load popular options on mount
  React.useEffect(() => {
    const loadPopular = async () => {
      try {
        const popular = await getPopularAirports();
        if (mode === "hotels" || mode === "cars") {
          // Extract unique cities/municipalities from the popular results
          const cityMap = new Map<
            string,
            { name: string; country: string; code: string }
          >();
          popular.forEach((a) => {
            if (a.municipality) {
              const key = a.municipality.toLowerCase().trim();
              if (!cityMap.has(key)) {
                let metroCode = "";
                if (a.keywords) {
                  const words = a.keywords.split(/[\s,.-]+/);
                  const candidate = words.find(
                    (w) =>
                      w.length === 3 &&
                      w === w.toUpperCase() &&
                      w !== a.iata_code,
                  );
                  if (candidate) {
                    metroCode = candidate;
                  }
                }
                if (!metroCode) {
                  metroCode = a.iata_code || a.gps_code || a.ident;
                }
                cityMap.set(key, {
                  name: a.municipality,
                  country: a.country_name,
                  code: metroCode,
                });
              }
            }
          });
          const mappedCities = Array.from(cityMap.values()).map(
            (city, idx) => ({
              id: `popular-city-${city.name}-${idx}`,
              type: "city",
              code: city.code,
              name: city.name,
              detail: city.country,
            }),
          );
          setPopularAirports(mappedCities);
        } else {
          const mapped = popular.map((a) => ({
            id: a.id,
            type: a.type,
            code: a.iata_code,
            name: a.name,
            detail: `${a.municipality ? a.municipality + ", " : ""}${a.country_name}`,
          }));
          setPopularAirports(mapped);
        }
      } catch (err) {
        console.error("Failed to load popular airports", err);
      }
    };
    loadPopular();
  }, [mode]);

  // Load recent options when recent data changes
  React.useEffect(() => {
    const loadRecent = async () => {
      try {
        // Get unique codes from last 3 searches
        const lastSearches = rawRecentData.slice(0, 3);
        const codes = new Set<string>();
        lastSearches.forEach((s) => {
          if (s.origin) codes.add(s.origin);
          if (s.destination) codes.add(s.destination);
        });

        const suggestions: Suggestion[] = [];
        for (const code of Array.from(codes)) {
          const airport = await getAirportByCode(code);
          if (airport) {
            if (mode === "hotels" || mode === "cars") {
              suggestions.push({
                id: `recent-city-${airport.municipality || code}`,
                type: "city",
                code: airport.iata_code,
                name: airport.municipality || airport.name,
                detail: airport.country_name,
              });
            } else {
              suggestions.push({
                id: airport.id,
                type: airport.type,
                code: airport.iata_code,
                name: airport.name,
                detail: `${airport.municipality ? airport.municipality + ", " : ""}${airport.country_name}`,
              });
            }
          } else {
            try {
              const airports = await fetchAirports();
              const lowerCode = code.toLowerCase();
              const metroMatch = airports.find((a) => {
                if (!a.keywords) return false;
                const words = a.keywords.toLowerCase().split(/[\s,.-]+/);
                return words.includes(lowerCode);
              });
              if (metroMatch) {
                suggestions.push({
                  id: `recent-city-${code}`,
                  type: "city",
                  code: code.toUpperCase(),
                  name: metroMatch.municipality,
                  detail: metroMatch.country_name,
                });
              }
            } catch (err) {
              console.error(err);
            }
          }
          if (suggestions.length >= 3) break;
        }
        setRecentAirports(suggestions);
      } catch (err) {
        console.error("Failed to load recent airports", err);
      }
    };
    if (rawRecentData.length > 0) {
      loadRecent();
    }
  }, [rawRecentData, mode]);

  // Unified reactive search and suggestions update
  React.useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const results = await searchAirports(trimmed);

          // Extract unique cities/municipalities from the results
          const cityMap = new Map<
            string,
            { name: string; country: string; code: string }
          >();
          results.forEach((a) => {
            if (a.municipality) {
              const key = a.municipality.toLowerCase().trim();
              if (!cityMap.has(key)) {
                let metroCode = "";
                if (a.keywords) {
                  const words = a.keywords.split(/[\s,.-]+/);
                  const candidate = words.find(
                    (w) =>
                      w.length === 3 &&
                      w === w.toUpperCase() &&
                      w !== a.iata_code,
                  );
                  if (candidate) {
                    metroCode = candidate;
                  }
                }
                if (!metroCode) {
                  metroCode = a.iata_code || a.gps_code || a.ident;
                }
                cityMap.set(key, {
                  name: a.municipality,
                  country: a.country_name,
                  code: metroCode,
                });
              }
            }
          });

          const citySuggestions: Suggestion[] = Array.from(
            cityMap.values(),
          ).map((city, idx) => ({
            id: `city-${city.name}-${idx}`,
            type: "city",
            code: city.code,
            name: city.name,
            detail: city.country,
          }));

          const airportSuggestions: Suggestion[] = results.map((a) => ({
            id: a.id,
            type: a.type,
            code: a.iata_code || a.gps_code || a.ident,
            name: a.name,
            detail: `${a.municipality ? a.municipality + ", " : ""}${a.country_name}`,
          }));

          // Filter based on mode: Hotels/Cars show only cities, Flights show only airports
          if (mode === "hotels" || mode === "cars") {
            setSuggestions(citySuggestions);
          } else {
            setSuggestions(airportSuggestions);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else if (trimmed.length === 0) {
      setSuggestions(
        recentAirports.length > 0 ? recentAirports : popularAirports,
      );
      setIsSearching(false);
    }
  }, [inputValue, recentAirports, popularAirports, mode]);

  const handleSelect = (suggestion: Suggestion) => {
    const newValue =
      mode === "hotels" || mode === "cars" ? suggestion.name : suggestion.code;
    setInputValue(newValue);
    setSelectedLabel(formatSuggestionDisplay(suggestion, mode));
    setIsEditing(false);
    onChange?.(newValue);

    setOpen(false);

    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue("");
    setSelectedLabel(null);
    setIsEditing(true);
    onChange?.("");
    if (inputRef.current) {
      inputRef.current.focus();
      setOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setSelectedLabel(null);
    setIsEditing(true);
    onChange?.(val);
    setOpen(true);
  };

  const shownValue = isEditing ? inputValue : (selectedLabel ?? inputValue);

  return (
    <Popover.Root
      open={disabled ? false : open}
      onOpenChange={disabled ? undefined : setOpen}
    >
      <Popover.Anchor asChild>
        <div
          className={cn(
            "relative flex items-center w-full transition-colors cursor-text px-3 group overflow-hidden h-full focus-visible:outline-none",
            glassPopover
              ? "bg-[#0e0e0e]/60 text-white hover:bg-white/10"
              : "bg-transparent hover:bg-muted/30 text-foreground",
            open && (glassPopover ? "bg-white/10 z-10" : "bg-muted/30 z-10"),
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            className,
          )}
          onClick={() => {
            if (disabled) return;
            // Focus the input when clicking anywhere in the container
            if (inputRef.current) {
              inputRef.current.focus();
              setOpen(true);
            }
          }}
          onMouseEnter={() => {
            if (disabled || !openOnHover) return;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setOpen(true);
          }}
          onMouseLeave={() => {
            if (disabled || !openOnHover) return;
            timeoutRef.current = setTimeout(() => {
              setOpen(false);
            }, 150);
          }}
        >
          <div className="relative z-10 flex flex-col flex-1 min-w-0">
            {(shownValue || inputValue) && (
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
              value={shownValue}
              onChange={handleInputChange}
              disabled={disabled}
              onFocus={() => {
                if (disabled) return;
                setIsEditing(true);
                if (selectedLabel) {
                  setInputValue("");
                }
                setOpen(true);
              }}
              onBlur={() => {
                if (disabled) return;
                timeoutRef.current = setTimeout(() => {
                  setOpen(false);

                  // If a selection was just made (handleSelect set isEditing=false),
                  // don't touch anything — selectedLabel is already correct.
                  if (!isEditingRef.current) return;

                  const trimmed = inputValueRef.current.trim();
                  if (trimmed) {
                    if (trimmed.length !== 3 && suggestions.length > 0) {
                      const bestMatch = suggestions[0];
                      if (bestMatch && bestMatch.code) {
                        const val =
                          mode === "hotels" || mode === "cars"
                            ? bestMatch.name
                            : bestMatch.code;
                        setInputValue(val);
                        setSelectedLabel(
                          formatSuggestionDisplay(bestMatch, mode),
                        );
                        setIsEditing(false);
                        onChange?.(val);
                      }
                    } else if (trimmed.length === 3) {
                      const uppercased = trimmed.toUpperCase();
                      setInputValue(uppercased);
                      setIsEditing(false);
                      onChange?.(uppercased);
                      getAirportByCode(uppercased).then((airport) => {
                        if (airport) {
                          if (mode === "hotels" || mode === "cars") {
                            setSelectedLabel(
                              airport.municipality || airport.name,
                            );
                          } else {
                            setSelectedLabel(formatAirportDisplay(airport));
                          }
                        }
                      });
                    }
                  } else {
                    setSelectedLabel(null);
                    setIsEditing(false);
                  }
                }, 150);
              }}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "Enter") {
                  const trimmed = inputValue.trim();
                  if (trimmed) {
                    if (trimmed.length !== 3 && suggestions.length > 0) {
                      const bestMatch = suggestions[0];
                      if (bestMatch && bestMatch.code) {
                        const val =
                          mode === "hotels" || mode === "cars"
                            ? bestMatch.name
                            : bestMatch.code;
                        setInputValue(val);
                        setSelectedLabel(
                          formatSuggestionDisplay(bestMatch, mode),
                        );
                        setIsEditing(false);
                        onChange?.(val);
                      }
                    } else if (trimmed.length === 3) {
                      const uppercased = trimmed.toUpperCase();
                      setInputValue(uppercased);
                      setIsEditing(false);
                      onChange?.(uppercased);
                      getAirportByCode(uppercased).then((airport) => {
                        if (airport) {
                          if (mode === "hotels" || mode === "cars") {
                            setSelectedLabel(
                              airport.municipality || airport.name,
                            );
                          } else {
                            setSelectedLabel(formatAirportDisplay(airport));
                          }
                        }
                      });
                    }
                  }
                  inputRef.current?.blur();
                  setOpen(false);
                }
              }}
              placeholder={placeholder}
              className={cn(
                "w-full bg-transparent border-none outline-none text-sm font-medium placeholder:font-medium truncate",
                glassPopover
                  ? "text-white placeholder:text-white/60"
                  : "text-foreground placeholder:text-foreground/60",
              )}
              autoComplete="off"
              title={selectedLabel ?? inputValue}
            />
          </div>
          {/* {(shownValue || inputValue) && (
            <button
              onClick={handleClear}
              className="relative z-10 p-1 hover:bg-brand-gray rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              type="button"
            >
              <X className="w-3 h-3 text-foreground/40" />
            </button>
          )} */}

          {/* <ChevronDown
            className={cn(
              "ml-1 h-3.5 w-3.5 shrink-0 transition-transform duration-300 relative z-10",
              glassPopover ? "text-white/60" : "text-foreground/40",
              open && "rotate-180",
            )}
          /> */}

          {shimmer && <div className="shimmer-effect" />}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className={cn(
            "z-[200] w-[var(--radix-popover-trigger-width)] min-w-[280px] overflow-hidden rounded-md border shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]",
            glassPopover
              ? "border-white/20 text-white bg-[#0e0e0e]/60 backdrop-blur-2xl"
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
                ? "border-white/15 bg-[#0e0e0e]/60"
                : "border-border bg-muted/40",
            )}
          >
            <span
              className={cn(
                "text-xs font-medium px-1",
                glassPopover ? "text-white/80" : "text-foreground/80",
              )}
            >
              {inputValue
                ? "Search Results"
                : recentAirports.length > 0
                  ? "Recent Searches"
                  : "Recent or Popular"}
            </span>
          </div>
          <div
            className="max-h-[200px] sm:max-h-[400px] overflow-y-auto no-scrollbar"
            onPointerDown={(e) => e.preventDefault()}
          >
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
                  {s.type === "city" && mode === "flights" ? (
                    <MapPin className="w-4 h-4 mr-2.5 text-muted-foreground/75 group-hover/item:text-brand-red transition-colors shrink-0" />
                  ) : null}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span
                      className={cn(
                        "font-medium text-xs truncate",
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
                      glassPopover
                        ? "text-white/90 bg-white/10"
                        : "text-foreground/70",
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
