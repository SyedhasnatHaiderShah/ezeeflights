"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

type SliderVariant = "default" | "ios";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  variant?: SliderVariant;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", ...props }, ref) => {
  const values = props.value || props.defaultValue || [0];
  const isIos = variant === "ios";

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        isIos && "py-1",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative w-full grow overflow-hidden rounded-full",
          isIos ? "h-1 bg-foreground/15" : "h-1.5 bg-primary/20",
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            "absolute h-full",
            isIos ? "bg-redmix" : "bg-brand-yellow",
          )}
        />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cn(
            "block rounded-full transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing",
            isIos
              ? "h-[22px] w-[22px] border border-black/10 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.28)] focus-visible:ring-2 focus-visible:ring-redmix/30 active:scale-95"
              : "h-4 w-4 border border-brand-yellow bg-foreground shadow hover:scale-110 active:scale-95 focus-visible:ring-1 focus-visible:ring-ring",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
