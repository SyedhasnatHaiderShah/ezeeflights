"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function FlightCardSkeleton() {
  return (
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border overflow-hidden shadow-sm flex flex-col md:flex-row relative animate-pulse">
      <div className="flex-grow p-4 md:p-5 flex flex-col gap-4">
        {/* Top bar skeleton */}
        <div className="flex flex-wrap items-center gap-4 mb-0.5">
          <div className="w-16 h-4 bg-gray-100 dark:bg-muted/20 rounded-md" />
          <div className="w-16 h-4 bg-gray-100 dark:bg-muted/20 rounded-md" />
          <div className="w-20 h-4 bg-gray-100 dark:bg-muted/20 rounded-md ml-auto" />
        </div>

        {/* Flight legs skeleton */}
        <div className="space-y-6 mt-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-[1.5]">
                <div className="w-8 h-8 bg-gray-100 dark:bg-muted/20 rounded-sm" />
                <div className="space-y-2">
                  <div className="w-24 h-5 bg-gray-100 dark:bg-muted/20 rounded-md" />
                  <div className="w-16 h-3 bg-gray-100 dark:bg-muted/20 rounded-md" />
                </div>
              </div>
              <div className="flex flex-col items-center flex-1 space-y-2">
                <div className="w-16 h-4 bg-gray-100 dark:bg-muted/20 rounded-md" />
                <div className="w-20 h-3 bg-gray-100 dark:bg-muted/20 rounded-md" />
              </div>
              <div className="flex flex-col items-end flex-1 space-y-2">
                <div className="w-16 h-4 bg-gray-100 dark:bg-muted/20 rounded-md" />
                <div className="w-12 h-3 bg-gray-100 dark:bg-muted/20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price section skeleton */}
      <div className="w-full md:w-[200px] flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-border/50 bg-gray-50/20 dark:bg-muted/5 p-4 md:p-5 flex flex-col justify-center items-center md:items-end gap-1">
        <div className="w-24 h-8 bg-gray-200 dark:bg-muted/30 rounded-md mb-1" />
        <div className="w-16 h-3 bg-gray-100 dark:bg-muted/20 rounded-md mb-4" />
        <div className="w-full h-10 bg-gray-200 dark:bg-muted/30 rounded-lg" />
      </div>
    </div>
  );
}

export function FlightResultSkeleton() {
  return (
    <div className="space-y-4">
      {/* Tabs Skeleton */}
      <div className="w-full h-14 bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border flex animate-pulse divide-x divide-gray-100 dark:divide-border/50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 flex flex-col justify-center items-center gap-2">
            <div className="w-16 h-3 bg-gray-100 dark:bg-muted/20 rounded-md" />
            <div className="w-12 h-4 bg-gray-200 dark:bg-muted/30 rounded-md" />
          </div>
        ))}
        <div className="w-20 bg-gray-50/10" />
      </div>

      {/* Info bar skeleton */}
      <div className="flex justify-between items-center px-1">
        <div className="w-32 h-3 bg-gray-100 dark:bg-muted/20 rounded-md" />
        <div className="w-24 h-3 bg-gray-100 dark:bg-muted/20 rounded-md" />
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
