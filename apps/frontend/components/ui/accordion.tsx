"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-b border-border/60 hover:border-brand-red/30 transition-all duration-500",
      "data-[state=open]:bg-brand-red/[0.015] data-[state=open]:border-brand-red/20",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-6 md:py-8 text-sm font-bold tracking-tight transition-all md:text-base text-left group [&[data-state=open]>div>svg]:rotate-180 [&[data-state=open]]:text-brand-red relative outline-none",
        className
      )}
      {...props}
    >
      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1 flex items-center gap-3">
        {children}
      </span>
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 group-hover:bg-brand-red/10 group-hover:text-brand-red transition-all duration-500 group-data-[state=open]:bg-brand-red group-data-[state=open]:text-white shadow-sm">
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-500 ease-in-out" />
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-8 md:pb-10 pt-2 text-muted-foreground font-medium leading-relaxed max-w-[92%] accordion-content-inner", className)}>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
