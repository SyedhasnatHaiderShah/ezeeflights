"use client";

import * as React from "react";
import { Clock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  className?: string;
  heroMode?: boolean;
  label?: string;
  openOnHover?: boolean;
  glassPopover?: boolean;
}

export function TimePicker({
  value = "12:00",
  onChange,
  className,
  heroMode,
  label = "Pick-up Time",
  openOnHover = false,
  glassPopover = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hour, minute] = value.split(":");
  const [activeTab, setActiveTab] = React.useState<"hours" | "minutes">("hours");
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutesArr = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  const handleHourChange = (newHour: string) => {
    onChange?.(`${newHour}:${minute}`);
    setTimeout(() => setActiveTab("minutes"), 100);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange?.(`${hour}:${newMinute}`);
  };

  const toggleOpen = (val: boolean) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(val);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between h-full px-3 py-1.5 bg-transparent hover:bg-brand-red/5 transition-all group rounded-none border-none shadow-none outline-none ring-0",
            open && "bg-brand-red/5 z-10",
            heroMode && "text-white hover:text-white hover:bg-white/10",
            className
          )}
          onMouseEnter={() => openOnHover && toggleOpen(true)}
          onMouseLeave={() => openOnHover && (timeoutRef.current = setTimeout(() => setOpen(false), 150))}
        >
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className={cn(
              "text-[9px] font-bold uppercase leading-none mb-0.5 tracking-tight transition-colors",
              heroMode ? "text-white/60 group-hover:text-white/90" : "text-foreground/60 group-hover:text-foreground/90"
            )}>
              {label}
            </span>
            <div className="flex items-center gap-1.5 w-full">
              <Clock className={cn("h-3 w-3 opacity-50", heroMode ? "text-white" : "text-foreground")} />
              <span className={cn(
                "font-bold text-sm tracking-tight",
                heroMode ? "text-white" : "text-foreground"
              )}>
                {value}
              </span>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "ml-1 h-3 w-3 shrink-0 transition-all duration-300 opacity-40 group-hover:opacity-100",
              heroMode ? "text-white" : "text-foreground",
              open && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-64 overflow-hidden rounded-[1.5rem] border p-3 shadow-2xl transition-all duration-300",
          glassPopover || heroMode
            ? "border-white/10 bg-white/10 backdrop-blur-2xl"
            : "border-border bg-background"
        )}
        align="start"
        sideOffset={8}
      >
        <div className="flex flex-col space-y-3">
          {/* Compact Digital Display */}
          <div className="flex items-center justify-center gap-2 py-1">
            <button
              onClick={() => setActiveTab("hours")}
              className={cn(
                "h-12 w-14 flex items-center justify-center text-2xl font-black rounded-xl transition-all duration-300",
                activeTab === "hours"
                  ? "bg-brand-red text-white shadow-md scale-105"
                  : heroMode ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-muted text-foreground/40 hover:bg-muted/80"
              )}
            >
              {hour}
            </button>
            <span className={cn("text-xl font-black opacity-20", heroMode ? "text-white" : "text-foreground")}>:</span>
            <button
              onClick={() => setActiveTab("minutes")}
              className={cn(
                "h-12 w-14 flex items-center justify-center text-2xl font-black rounded-xl transition-all duration-300",
                activeTab === "minutes"
                  ? "bg-brand-red text-white shadow-md scale-105"
                  : heroMode ? "bg-white/5 text-white/40 hover:bg-white/10" : "bg-muted text-foreground/40 hover:bg-muted/80"
              )}
            >
              {minute}
            </button>
          </div>

          {/* Compact Selection Grid */}
          <div className="relative h-44">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-4 gap-1.5 h-full content-start overflow-y-auto no-scrollbar py-1"
              >
                {(activeTab === "hours" ? hours : minutesArr).map((v) => {
                  const isSelected = (activeTab === "hours" ? hour : minute) === v;
                  const isStep = parseInt(v) % (activeTab === "hours" ? 6 : 15) === 0;
                  
                  return (
                    <button
                      key={v}
                      onClick={() => activeTab === "hours" ? handleHourChange(v) : handleMinuteChange(v)}
                      className={cn(
                        "h-8 rounded-lg text-[13px] font-bold transition-all duration-200",
                        isSelected
                          ? "bg-brand-red text-white"
                          : heroMode 
                            ? cn("text-white/60 hover:text-white hover:bg-white/10", isStep && "bg-white/5") 
                            : cn("text-foreground/60 hover:text-foreground hover:bg-muted", isStep && "bg-muted/40")
                      )}
                    >
                      {v}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between items-center">
            <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-30 px-1", heroMode ? "text-white" : "text-foreground")}>
              24H
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-lg font-black uppercase tracking-widest text-[9px] px-4 h-7 transition-all",
                heroMode ? "text-white bg-white/10 hover:bg-white/20" : "text-brand-red bg-brand-red/5 hover:bg-brand-red/10"
              )}
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
