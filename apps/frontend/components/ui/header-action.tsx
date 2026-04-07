"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeaderActionProps {
  icon: LucideIcon;
  label?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'red' | 'default';
}

export function HeaderAction({ 
  icon: Icon, 
  label, 
  onClick, 
  className,
  variant = 'default'
}: HeaderActionProps) {
  const isPill = !!label;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center transition-all duration-300 active:scale-95",
        "bg-white border border-redmix/20 shadow-sm hover:shadow-md hover:bg-redmix/[0.02]",
        "dark:bg-redmix dark:border-transparent dark:shadow-redmix/20",
        isPill ? "px-4 h-10 rounded-full gap-2.5" : "w-10 h-10 rounded-full",
        className
      )}
    >
      <Icon 
        className={cn(
          "shrink-0",
          isPill ? "w-4 h-4" : "w-5 h-5",
          "text-redmix fill-redmix",
          "dark:text-white dark:fill-white"
        )} 
      />
      {label && (
        <span className="text-sm font-bold tracking-tight text-foreground/90 uppercase text-[11px] dark:text-white">
          {label}
        </span>
      )}
    </button>
  );
}
