"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const GROUP_SURFACE =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50";

function FilterSidebarSkeleton() {
  return (
    <div className="space-y-4 px-1 py-2 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-md" />
        <div className={cn(GROUP_SURFACE, "p-4 space-y-3")}>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-10 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-md" />
        <div className={cn(GROUP_SURFACE, "p-4 space-y-3")}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AiSidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className={cn(GROUP_SURFACE, "p-4 space-y-3")}>
        <Skeleton className="h-4 w-28 rounded-md" />
        <div className="rounded-xl bg-muted/10 p-3 space-y-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      </div>
      <div className={cn(GROUP_SURFACE, "p-4 space-y-3")}>
        <Skeleton className="h-4 w-20 rounded-md" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-32 rounded-md" />
            <Skeleton className="h-3 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-card flex flex-col md:flex-row gap-4 h-auto md:h-[160px]">
      {/* Details Placeholder */}
      <div className="flex-1 flex flex-col justify-between py-1 space-y-3 md:space-y-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="h-3 w-28 rounded-md" />
          <Skeleton className="h-3.5 w-32 rounded-md" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-0 pt-2 border-t border-border/40">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-3.5 w-20 rounded-md" />
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HotelResultSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[240px_minmax(0,1fr)_380px] gap-6 px-4 relative">
      <div className="hidden lg:block border-r border-border/50 pr-6 py-5">
        <FilterSidebarSkeleton />
      </div>
      <div className="py-5 space-y-4 min-w-0">
        <div className="flex flex-col space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <HotelCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="hidden md:block border-l border-border/50 pl-6 py-5">
        <AiSidebarSkeleton />
      </div>
    </div>
  );
}
