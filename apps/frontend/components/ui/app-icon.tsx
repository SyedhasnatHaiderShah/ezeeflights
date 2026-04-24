"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface AppIconProps {
  icon: LucideIcon;
  label?: string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
  variant?: "red" | "default";
  isActive?: boolean;
  asChild?: boolean;
  isFill?: boolean;
  animate?: boolean;
  animationType?: "flying" | "none";
  children?: React.ReactNode;
}
export function AppIcon({
  icon: Icon,
  label,
  onClick,
  className,
  iconClassName,
  variant = "default",
  isActive = false,
  asChild = false,
  isFill = false,
  animate = true,
  animationType = "none",
  children,
}: AppIconProps) {
  const isPill = !!label;
  const Comp = asChild ? Slot : onClick ? "button" : "div";

  const IconComp = animationType === "flying" ? motion(Icon) : Icon;
  const animationProps =
    animationType === "flying"
      ? {
          animate: { x: [-3, 3, -3] },
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        }
      : {};

  const content = (
    <>
      <motion.div
        {...animationProps}
        className="flex items-center justify-center"
      >
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
            iconClassName,
          )}
        />
      </motion.div>
      {label && (
        <span
          className={cn(
            "tracking-tight transition-colors",
            !isActive && "text-inherit",
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
          animate &&
            "shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-redmix/[0.04]",
          "dark:bg-secondary/40 dark:shadow-none",
          animate && "dark:hover:bg-redmix/70",
        ],
        // Active Styling
        isActive && [
          "bg-gradient-to-tl from-redmix to-redmix-light shadow-lg shadow-redmix/20 scale-105 transition-all text-white",
          "dark:shadow-redmix/40",
        ],
        className,
      )}
    >
      {asChild && React.isValidElement(children) ? (
        React.cloneElement(
          children,
          (children as any).props,
          <>
            <motion.div
              {...animationProps}
              className="flex items-center justify-center"
            >
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
                  iconClassName,
                )}
              />
            </motion.div>
            {label && (
              <span
                className={cn(
                  "tracking-tight transition-colors",
                  !isActive && "text-inherit",
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
          <motion.div
            {...animationProps}
            className="flex items-center justify-center"
          >
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
                iconClassName,
              )}
            />
          </motion.div>
          {label && (
            <span
              className={cn(
                "transition-colors",
                !isActive && "text-inherit",
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
