"use client";

import * as React from "react";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppIcon } from "@/components/ui/app-icon";
import faqData from "@/constants/faq-data.json";

export function FAQSection() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredData = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split into two columns for desktop
  const midpoint = Math.ceil(filteredData.length / 2);
  const leftCol = filteredData.slice(0, midpoint);
  const rightCol = filteredData.slice(midpoint);

  return (
    <section className="py-20 bg-muted/20 dark:bg-muted/5 border-t border-border/40 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-4 max-w-2xl">
            <span className="text-brand-red font-bold uppercase tracking-[0.2em] text-xs block">
              Support Center
            </span>
            <h2 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
              Frequently Asked <span className="text-redmix">Questions.</span>
            </h2>
            <p className="text-base text-muted-foreground font-medium max-w-xl">
              Get instant answers to the most common queries about booking,
              changes, and baggage. Can&apos;t find what you&apos;re looking for? Calls
              us 24/7.
            </p>
          </div>

          <div className="relative w-full lg:max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <AppIcon icon={Search} className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-6 rounded-2xl bg-background border border-border/60 focus:border-redmix/40 focus:ring-4 focus:ring-redmix/5 transition-all outline-none text-sm font-medium"
            />
          </div>
        </div>

        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 lg:gap-x-24">
            <Accordion type="single" collapsible className="w-full">
              {leftCol.map((item, idx) => (
                <AccordionItem key={`left-${idx}`} value={`left-${idx}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Accordion type="single" collapsible className="w-full lg:pt-0">
              {rightCol.map((item, idx) => (
                <AccordionItem key={`right-${idx}`} value={`right-${idx}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/60 bg-background/50">
            <div className="inline-flex p-4 rounded-full bg-muted/40 text-muted-foreground">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-muted-foreground font-medium">
              No results found for &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-redmix font-bold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
