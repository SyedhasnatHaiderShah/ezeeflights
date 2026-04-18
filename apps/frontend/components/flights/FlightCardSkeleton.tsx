"use client";

export function FlightCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-muted" />
          <div className="space-y-2"><div className="h-4 w-32 rounded bg-muted" /><div className="h-3 w-20 rounded bg-muted" /></div>
        </div>
        <div className="h-6 w-20 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-3 gap-4 items-center">
        <div className="space-y-2"><div className="h-7 w-12 rounded bg-muted" /><div className="h-5 w-16 rounded bg-muted" /></div>
        <div className="space-y-2"><div className="h-4 w-20 rounded mx-auto bg-muted" /><div className="h-4 w-full rounded bg-muted" /><div className="h-5 w-24 rounded-full mx-auto bg-muted" /></div>
        <div className="space-y-2 justify-self-end"><div className="h-7 w-12 rounded bg-muted" /><div className="h-5 w-16 rounded bg-muted" /></div>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="h-3 w-48 rounded bg-muted" />
        <div className="flex items-center gap-3"><div className="h-10 w-20 rounded bg-muted" /><div className="h-10 w-24 rounded bg-muted" /></div>
      </div>
    </div>
  );
}

export function FlightResultSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <FlightCardSkeleton key={i} />
      ))}
    </div>
  );
}
