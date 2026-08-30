"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { isNative } from "@/lib/capacitor/platform";

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  className?: string;
  heroMode?: boolean;
  label?: string;
  openOnHover?: boolean;
  glassPopover?: boolean;
  disabled?: boolean;
}

export function TimePicker({
  value = "12:00",
  onChange,
  className,
  heroMode,
  label = "Pick-up Time",
  openOnHover = false,
  glassPopover = false,
  disabled = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"hour" | "minute">("hour");
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const [tempHour, setTempHour] = React.useState("12");
  const [tempMin, setTempMin] = React.useState("00");
  const [ampm, setAmpm] = React.useState<"AM" | "PM">("AM");

  // Sync state with parent value
  React.useEffect(() => {
    if (open) {
      const parts = (value || "12:00").split(":");
      const rawHour = parseInt(parts[0] || "12", 10);
      const rawMin = parseInt(parts[1] || "00", 10);

      let h12 = rawHour % 12;
      if (h12 === 0) h12 = 12;
      const isPm = rawHour >= 12;

      setTempHour(h12.toString().padStart(2, "0"));

      const rounded = Math.round(rawMin / 5) * 5;
      const normalizedMin = rounded >= 60 ? 55 : rounded;
      setTempMin(normalizedMin.toString().padStart(2, "0"));

      setAmpm(isPm ? "PM" : "AM");
      setActiveTab("hour");
    }
  }, [open, value]);

  const get24HTime = (
    h12Str: string,
    minStr: string,
    currentAmpm: "AM" | "PM",
  ) => {
    let h24 = parseInt(h12Str, 10) || 12;
    const m = (parseInt(minStr, 10) || 0).toString().padStart(2, "0");

    if (currentAmpm === "AM") {
      if (h24 === 12) h24 = 0;
    } else {
      if (h24 !== 12) h24 += 12;
    }
    return `${h24.toString().padStart(2, "0")}:${m}`;
  };

  const updateTime = (h: string, m: string, p: "AM" | "PM") => {
    const time24 = get24HTime(h, m, p);
    onChange?.(time24);
  };

  const hours = [
    "12",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
  ];
  const minutes = [
    "00",
    "05",
    "10",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
    "55",
  ];

  const getDialPosition = (index: number, total: number, radius = 54) => {
    const angle = (index * (360 / total) - 90) * (Math.PI / 180);
    const cx = 80; // center X (160 / 2)
    const cy = 80; // center Y (160 / 2)
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return { x, y };
  };

  const activeIndex = React.useMemo(() => {
    if (activeTab === "hour") {
      return hours.indexOf(tempHour);
    } else {
      return minutes.indexOf(tempMin);
    }
  }, [activeTab, tempHour, tempMin]);

  const handPosition = React.useMemo(() => {
    if (activeIndex === -1) return { x: 80, y: 80 };
    return getDialPosition(activeIndex, 12, 54);
  }, [activeIndex]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const toggleOpen = (val: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(val);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          className={cn(
            "w-full justify-between h-full px-3 py-2 bg-transparent hover:bg-redmix/5 transition-colors group rounded-none border-none shadow-none outline-none ring-0",
            open && "bg-redmix/5 z-10",
            heroMode && "text-white hover:text-white hover:bg-white/10",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          onMouseEnter={() => !disabled && openOnHover && toggleOpen(true)}
          onMouseLeave={() =>
            !disabled &&
            openOnHover &&
            (timeoutRef.current = setTimeout(() => setOpen(false), 150))
          }
        >
          <div className="flex flex-col items-start flex-1 min-w-0">
            {label && (
              <span
                className={cn(
                  "text-[10px] font-semibold capitalize leading-none mb-0.5 tracking-tight",
                  glassPopover || heroMode
                    ? "text-white/70"
                    : "text-foreground/70",
                )}
              >
                {label}
              </span>
            )}
            <div className="flex items-center gap-1.5 w-full">
              <span
                className={cn(
                  "truncate font-semibold text-sm tracking-tight h-5",
                  glassPopover || heroMode ? "text-white" : "text-foreground",
                )}
              >
                {value}
              </span>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "ml-1 h-3.5 w-3.5 shrink-0 transition-all duration-300 opacity-40 group-hover:opacity-100",
              glassPopover || heroMode ? "text-white/60" : "text-foreground/40",
              open && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "z-[200] w-[230px] p-3 overflow-hidden rounded-[24px] border shadow-2xl transition-all duration-300 select-none",
          glassPopover || heroMode
            ? "border-white/20 text-white bg-[#0e0e0e]/60 backdrop-blur-2xl"
            : "border-border bg-background text-foreground",
        )}
        align="end"
        sideOffset={8}
        collisionPadding={12}
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
        {/* <div className="text-[10px] font-bold text-muted-foreground/80 tracking-wide mb-2.5 pl-0.5">
          Select time
        </div> */}

        {/* Compact Time Display */}
        <div className="flex items-center justify-between gap-2.5 mb-1">
          <div className="flex items-center gap-1.5 flex-1 justify-center">
            {/* Hour Display */}
            <button
              type="button"
              onClick={() => setActiveTab("hour")}
              className={cn(
                "w-[60px] h-[52px] flex items-center justify-center text-xl font-bold rounded-md transition-all duration-200 ",
                activeTab === "hour"
                  ? "bg-redmix/10 border-redmix text-white"
                  : "bg-muted/40 border-transparent text-foreground",
              )}
            >
              {tempHour}
            </button>

            <span className="text-xl font-bold text-muted-foreground/60">
              :
            </span>

            {/* Minute Display */}
            <button
              type="button"
              onClick={() => setActiveTab("minute")}
              className={cn(
                "w-[60px] h-[52px] flex items-center justify-center text-2xl font-bold rounded-md transition-all duration-200",
                activeTab === "minute"
                  ? "bg-redmix/10 border-redmix text-white"
                  : "bg-muted/40 border-transparent text-foreground",
              )}
            >
              {tempMin}
            </button>
          </div>

          {/* Compact AM/PM Selector */}
          <div className="flex flex-col h-[52px] rounded-md border border-border/60 overflow-hidden shrink-0 divide-y divide-border/60">
            <button
              type="button"
              onClick={() => {
                setAmpm("AM");
                updateTime(tempHour, tempMin, "AM");
              }}
              className={cn(
                "w-10 flex-1 flex items-center justify-center text-xs font-extrabold transition-all duration-150",
                ampm === "AM"
                  ? "bg-redmix/10 text-white"
                  : "hover:bg-muted text-muted-foreground",
              )}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => {
                setAmpm("PM");
                updateTime(tempHour, tempMin, "PM");
              }}
              className={cn(
                "w-10 flex-1 flex items-center justify-center text-xs font-extrabold transition-all duration-150",
                ampm === "PM"
                  ? "bg-redmix/10 text-white"
                  : "hover:bg-muted text-muted-foreground",
              )}
            >
              PM
            </button>
          </div>
        </div>

        {/* Dial Area */}
        <div className="flex items-center justify-center py-1">
          <div className="relative w-40 h-40 rounded-full bg-muted/30 dark:bg-white/5 flex items-center justify-center">
            {/* Center dot */}
            <div className="absolute w-1.5 h-1.5 rounded-full bg-redmix z-20" />

            {/* Clock Hand */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <line
                x1="80"
                y1="80"
                x2={handPosition.x}
                y2={handPosition.y}
                stroke="var(--redmix, #c52a28)"
                strokeWidth="1.5"
              />
              <circle
                cx={handPosition.x}
                cy={handPosition.y}
                r="3"
                fill="var(--redmix, #c52a28)"
              />
            </svg>

            {/* Dial Numbers */}
            {activeTab === "hour"
              ? hours.map((h, i) => {
                  const pos = getDialPosition(i, 12, 54);
                  const isSelected = h === tempHour;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        setTempHour(h);
                        setActiveTab("minute");
                        updateTime(h, tempMin, ampm);
                      }}
                      style={{
                        position: "absolute",
                        left: `${pos.x - 12}px`,
                        top: `${pos.y - 12}px`,
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-150 cursor-pointer outline-none",
                        isSelected
                          ? "bg-redmix text-white scale-110 z-20"
                          : "text-foreground/80 hover:bg-muted/70 dark:hover:bg-white/10",
                      )}
                    >
                      {parseInt(h, 10)}
                    </button>
                  );
                })
              : minutes.map((m, i) => {
                  const pos = getDialPosition(i, 12, 54);
                  const isSelected = m === tempMin;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setTempMin(m);
                        updateTime(tempHour, m, ampm);
                        setOpen(false); // Done choosing both, auto close
                      }}
                      style={{
                        position: "absolute",
                        left: `${pos.x - 12}px`,
                        top: `${pos.y - 12}px`,
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-150 cursor-pointer outline-none",
                        isSelected
                          ? "bg-redmix text-white scale-110 z-20"
                          : "text-foreground/80 hover:bg-muted/70 dark:hover:bg-white/10",
                      )}
                    >
                      {m}
                    </button>
                  );
                })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
