import * as React from "react";
import { cn } from "@/lib/utils";

interface HoverTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "top-left" | "top-right" | "bottom" | "bottom-left" | "bottom-right" | "left" | "right";
  className?: string;
}

export function HoverTooltip({
  children,
  content,
  position = "top",
  className,
}: HoverTooltipProps) {
  const positionClasses = {
    top: "bottom-full mb-2 right-1/2 translate-x-1/2",
    "top-left": "bottom-full mb-2 right-0", // Aligns right edge to button's right, expands left
    "top-right": "bottom-full mb-2 left-0", // Aligns left edge to button's left, expands right
    bottom: "top-full mt-2 right-1/2 translate-x-1/2",
    "bottom-left": "top-full mt-2 right-0",
    "bottom-right": "top-full mt-2 left-0",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div className="relative group/hover-tooltip flex items-center justify-center">
      {children}
      <div
        className={cn(
          "absolute opacity-0 group-hover/hover-tooltip:opacity-100 pointer-events-none transition-opacity duration-200 z-[100] rounded-lg border border-border/80 bg-popover px-2 py-1 text-center text-xs font-medium text-popover-foreground shadow-md w-max",
          positionClasses[position],
          className
        )}
      >
        {content}
      </div>
    </div>
  );
}
