"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const GROUP_SURFACE =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50";

export function FilterSidebarSkeleton() {
  return (
    <div className="space-y-2.5 px-1 py-2 animate-pulse">
      {/* Price Range */}
      <div className="space-y-2">
        <Skeleton className="mx-1 h-4 w-24 rounded-md" />
        <div className={cn(GROUP_SURFACE, "p-3 space-y-3")}>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-10 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
        </div>
      </div>

      {/* Stops */}
      <div className="space-y-2">
        <Skeleton className="mx-1 h-4 w-20 rounded-md" />
        <div className={cn(GROUP_SURFACE, "p-3 space-y-3")}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-16 rounded-md" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Airlines */}
      <div className="space-y-2">
        <Skeleton className="mx-1 h-4 w-24 rounded-md" />
        <div className={cn(GROUP_SURFACE, "p-3 space-y-3")}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </div>
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Flight Number */}
      <div className="space-y-2">
        <Skeleton className="mx-1 h-4 w-24 rounded-md" />
        <div className={cn(GROUP_SURFACE, "p-3")}>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Departure Time */}
      <div className="space-y-2">
        <Skeleton className="mx-1 h-4 w-28 rounded-md" />
        <div className={cn(GROUP_SURFACE, "p-3")}>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AirlineMatrixSkeleton() {
  return (
    <div
      className={cn(
        GROUP_SURFACE,
        "hidden md:block px-2.5 py-2 animate-pulse",
      )}
    >
      <Skeleton className="mb-2 ml-1 h-3 w-14 rounded-md" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex min-w-[68px] flex-col items-center gap-1.5">
            <Skeleton className="h-11 w-11 rounded-full" />
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SortBarSkeleton() {
  return (
    <div
      className={cn(
        "hidden md:flex animate-pulse items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-2",
      )}
    >
      <Skeleton className="h-3.5 w-44 rounded-md" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-14 rounded-md" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function AiSidebarSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-3 animate-pulse">
      {/* Weather */}
      <div className={cn(GROUP_SURFACE, "p-4 space-y-3")}>
        <Skeleton className="h-3.5 w-20 rounded-md" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Attractive Places */}
      <div className={cn(GROUP_SURFACE, "p-4 space-y-3")}>
        <Skeleton className="h-3.5 w-28 rounded-md" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="h-3 w-8 rounded-md" />
          </div>
        ))}
      </div>

      {/* Available Hotels */}
      <div className={cn(GROUP_SURFACE, "p-4 space-y-3")}>
        <Skeleton className="h-3.5 w-28 rounded-md" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center h-[86px] p-3 rounded-xl border border-border/50 bg-card">
            <Skeleton className="w-[60px] h-[60px] rounded-lg shrink-0 mr-3" />
            <div className="flex-1 flex items-center justify-between min-w-0 gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="h-2.5 w-20 rounded-md" />
                <Skeleton className="h-2 w-16 rounded-md" />
              </div>
              <div className="text-right shrink-0 space-y-1">
                <Skeleton className="h-2 w-16 rounded-md ml-auto" />
                <Skeleton className="h-3 w-12 rounded-md ml-auto" />
                <Skeleton className="h-2.5 w-16 rounded-md ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileControlsSkeleton() {
  return (
    <div className="sticky top-[calc(3.5rem+3.5rem)] z-30 col-span-full -mx-4 border-b border-border/40 bg-background/80 px-4 py-2 backdrop-blur-xl lg:hidden">
      <Skeleton className="h-11 w-full rounded-[10px]" />
    </div>
  );
}

export function FlightCardSkeleton() {
  const searchParams = useSearchParams();
  const isRoundTrip = !!(
    searchParams.get("rDate") ||
    searchParams.get("returnDate") ||
    searchParams.get("trip") === "round-trip"
  );

  const renderLeg = () => (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="space-y-2">
        <Skeleton className="h-7 w-14 rounded-md" />
        <Skeleton className="h-4 w-10 rounded-md" />
      </div>
      <div className="flex flex-col items-center gap-2 px-2">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-px w-20 bg-muted" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="justify-self-end space-y-2 text-right">
        <Skeleton className="ml-auto h-7 w-14 rounded-md" />
        <Skeleton className="ml-auto h-4 w-10 rounded-md" />
      </div>
    </div>
  );

  return (
    <div className="animate-pulse rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-card xl:flex xl:flex-row">
      <div className="flex-1 space-y-4 xl:p-1">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full xl:rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
        
        {renderLeg()}

        {isRoundTrip && (
          <div className="mt-4 pt-4 border-t border-dashed border-border">
            {renderLeg()}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Skeleton className="h-3.5 w-32 rounded-md" />
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center justify-center gap-3 border-t border-border pt-4 xl:mt-0 xl:w-52 xl:shrink-0 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-11 w-full max-w-[160px] rounded-2xl" />
      </div>
    </div>
  );
}

function FlightListSkeleton() {
  return (
    <div className="space-y-3 md:px-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <FlightCardSkeleton key={i} />
      ))}
    </div>
  );
}

type FlightResultSkeletonProps = {
  /** Use inside FlightSearchContainer (no outer grid / mobile bar). */
  embedded?: boolean;
};

export function FlightResultSkeleton({
  embedded = false,
}: FlightResultSkeletonProps = {}) {
  const mainColumn = (
    <main className="relative flex min-w-0 flex-col md:min-h-0">
      <div className="hidden shrink-0 space-y-2 md:block md:px-5 md:py-2">
        <AirlineMatrixSkeleton />
        <SortBarSkeleton />
      </div>
      <FlightListSkeleton />
    </main>
  );

  if (embedded) {
    return mainColumn;
  }

  return (
    <div className="mx-auto grid min-h-0 max-w-[1440px] grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_320px] md:gap-5 lg:grid-cols-[220px_minmax(0,1fr)_380px] lg:grid-rows-1">
      <MobileControlsSkeleton />

      <div className="hidden min-h-0 border-r border-border/50 lg:block">
        <FilterSidebarSkeleton />
      </div>

      {mainColumn}

      <div className="hidden min-h-0 border-l border-border/40 md:block">
        <AiSidebarSkeleton />
      </div>
    </div>
  );
}

