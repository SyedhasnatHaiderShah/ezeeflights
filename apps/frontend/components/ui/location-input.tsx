"use client"

import * as React from "react"
import * as Popover from "@radix-ui/react-popover"
import { MapPin, Plane, Building, X, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Suggestion {
  id: string;
  type: string;
  code: string;
  name: string;
  detail: string;
}

const SUGGESTIONS: Suggestion[] = [
  { id: "1", type: "airport", code: "LHE", name: "Lahore", detail: "Allama Iqbal Intl (LHE)" },
  { id: "2", type: "airport", code: "DXB", name: "Dubai", detail: "Dubai Intl (DXB)" },
  { id: "3", type: "airport", code: "JFK", name: "New York", detail: "John F Kennedy Intl (JFK)" },
  { id: "4", type: "city", code: "LON", name: "London", detail: "United Kingdom (LON)" },
  { id: "5", type: "airport", code: "LHR", name: "London", detail: "Heathrow (LHR)" },
]

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
  shimmer = true
}: LocationInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || "")

  // Sync internal state with prop value for controlled behavior
  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);


  const handleSelect = (suggestion: Suggestion) => {
    setInputValue(suggestion.code)
    onChange?.(suggestion.code)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setInputValue("")
    onChange?.("")
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div
          className={cn(
            "relative flex items-center w-full bg-background hover:bg-brand-red/5 transition-all cursor-text px-2.5 group overflow-hidden",
            open && "bg-background ring-2 ring-brand-red/20 z-10",
            className
          )}
        >
          <Icon className="relative z-10 w-4 h-4 text-foreground/60 mr-2 shrink-0 group-hover:text-brand-red transition-colors" />
          <div className="relative z-10 flex flex-col flex-1 min-w-0">
            {inputValue && (
              <span className="text-[10px] font-semibold text-brand-red capitalize leading-none mb-0.5 tracking-tight animate-in slide-in-from-bottom-1 fade-in duration-200">
                {placeholder}
              </span>
            )}
            <input
              id={id}
              type="text"
              value={inputValue}
              onChange={(e) => { 
                const val = e.target.value;
                setInputValue(val); 
                onChange?.(val);
                if (!open) setOpen(true); 
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="w-full bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-foreground/60 placeholder:font-medium"
              autoComplete="off"
            />
          </div>
          {inputValue && (
            <button
              onClick={handleClear}
              className="relative z-10 p-1 hover:bg-brand-gray rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-foreground/40" />
            </button>
          )}

          {shimmer && (
            <div className="shimmer-effect" />
          )}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className="w-[var(--radix-popover-trigger-width)] bg-background border border-border shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-b-xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300"
          sideOffset={0}
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="p-2 bg-muted/30 border-b border-border">
            <span className="text-xs font-semibold text-foreground/40 capitalize tracking-widest px-1">
              Recent or Popular
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto no-scrollbar">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className="flex items-center w-full p-2.5 hover:bg-brand-red/5 transition-colors text-left border-b border-border/40 last:border-0 group/item"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-md mr-3 group-hover/item:bg-brand-red/10 transition-colors">
                  {s.type === "airport" ? <Plane className="w-4 h-4 text-foreground/60 group-hover/item:text-brand-red" /> : <Building className="w-4 h-4 text-foreground/60 group-hover/item:text-brand-red" />}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-foreground text-sm truncate">{s.name}</span>
                  <span className="text-xs text-foreground/50 truncate font-medium">{s.detail}</span>
                </div>
                <span className="ml-3 font-semibold text-[10px] text-foreground/30 capitalize tracking-tighter">
                  {s.code}
                </span>
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
