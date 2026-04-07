"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface AppIconProps {
  icon: LucideIcon;
  label?: string;
  onClick?: () => void;
  className?: string;
  variant?: "red" | "default";
  isActive?: boolean;
  asChild?: boolean;
  isFill?: boolean;
  animate?: boolean;
  children?: React.ReactNode;
}

export function AppIcon({
  icon: Icon,
  label,
  onClick,
  className,
  variant = "default",
  isActive = false,
  asChild = false,
  isFill = false,
  animate = true,
  children,
}: AppIconProps) {
  const isPill = !!label;
  const Comp = asChild ? Slot : onClick ? "button" : "div";

  const content = (
    <>
      <Icon
        className={cn(
          "shrink-0 transition-colors",
          isPill ? "w-4 h-4" : "w-5 h-5",
          // Inactive colors
          !isActive && [
            "text-redmix",
            isFill ? "fill-redmix" : "fill-none",
            "dark:text-muted-foreground group-hover:dark:text-foreground",
            isFill ? "dark:fill-muted-foreground" : "dark:fill-none",
          ],
          // Active colors
          isActive && ["text-white", isFill ? "fill-white" : "fill-none"],
        )}
      />
      {label && (
        <span
          className={cn(
            "text-sm font-bold tracking-tight uppercase text-[11px] transition-colors",
            !isActive &&
              "text-foreground/90 dark:text-muted-foreground group-hover:dark:text-foreground",
            isActive && "text-white",
          )}
        >
          {label}
        </span>
      )}
      {children}
    </>
  );

  return (
    <Comp
      onClick={onClick}
      type={Comp === "button" ? "button" : undefined}
      className={cn(
        "flex items-center justify-center transition-all duration-300 active:scale-95 group cursor-pointer",
        isPill ? "px-4 h-10 rounded-full gap-2.5" : "w-10 h-10 rounded-full",
        // Base Styling (Inactive)
        !isActive && [
          "bg-white border-none transition-all",
          animate && "shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-redmix/[0.04]",
          "dark:bg-secondary/40 dark:shadow-none",
          animate && "dark:hover:bg-redmix/70",
        ],
        // Active Styling
        isActive && [
          "bg-gradient-to-tl from-brand-red to-brand-red-light shadow-lg shadow-brand-red/20 scale-105 transition-all text-white",
          "dark:shadow-brand-red/40",
        ],
        className,
      )}
    >
      {asChild && React.isValidElement(children) ? (
        React.cloneElement(
          children,
          (children as any).props,
          <>
            <Icon
              className={cn(
                "shrink-0 transition-colors",
                isPill ? "w-4 h-4" : "w-5 h-5",
                // Inactive colors
                !isActive && [
                  "text-redmix",
                  isFill ? "fill-redmix" : "fill-none",
                  "dark:text-muted-foreground group-hover:dark:text-foreground",
                  isFill ? "dark:fill-muted-foreground" : "dark:fill-none",
                ],
                // Active colors
                isActive && ["text-white", isFill ? "fill-white" : "fill-none"],
              )}
            />
            {label && (
              <span
                className={cn(
                  "text-sm font-bold tracking-tight uppercase text-[11px] transition-colors",
                  !isActive &&
                    "text-foreground/90 dark:text-muted-foreground group-hover:dark:text-foreground",
                  isActive && "text-white",
                )}
              >
                {label}
              </span>
            )}
            {(children as any).props.children}
          </>,
        )
      ) : (
        <>
          <Icon
            className={cn(
              "shrink-0 transition-colors",
              isPill ? "w-4 h-4" : "w-5 h-5",
              // Inactive colors
              !isActive && [
                "text-redmix",
                isFill ? "fill-redmix" : "fill-none",
                "dark:text-gray-100 group-hover:dark:text-foreground",
                isFill ? "dark:fill-gray-100" : "dark:fill-none",
              ],
              // Active colors
              isActive && ["text-white", isFill ? "fill-white" : "fill-none"],
            )}
          />
          {label && (
            <span
              className={cn(
                "text-sm font-bold tracking-tight text-xs transition-colors",
                !isActive &&
                  "text-foreground/90 dark:text-gray-100 group-hover:dark:text-foreground",
                isActive && "text-white",
              )}
            >
              {label}
            </span>
          )}
          {children}
        </>
      )}
    </Comp>
  );
}
