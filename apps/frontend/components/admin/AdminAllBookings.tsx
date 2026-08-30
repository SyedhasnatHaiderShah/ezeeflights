"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingAmountCell } from "@/components/admin/BookingAmountCell";

interface AdminAllBookingsProps {
  onRefetch?: () => void;
}

export function AdminAllBookings({ onRefetch }: AdminAllBookingsProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const bookingsQuery = useQuery({
    queryKey: ["admin-bookings", page, limit],
    queryFn: () =>
      adminFetch<any[]>(`/bookings?limit=${limit}&page=${page}&tab=finalized`),
  });

  const typeColors: Record<string, string> = {
    flight:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50",
    hotel:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50",
    car: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50",
    transfer:
      "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200/50",
    package:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200/50",
    inquiry:
      "bg-slate-50 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200/50",
  };

  const stColors: Record<string, string> = {
    confirmed:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50",
    pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50",
    cancelled:
      "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200/50",
    closed:
      "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200/50",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Confirmed Bookings
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            View and manage all successfully confirmed flight bookings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Limit:
          </span>
          <Select
            value={limit.toString()}
            onValueChange={(val) => {
              setLimit(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[100px] font-bold text-xs">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((lim) => (
                <SelectItem key={lim} value={lim.toString()} className="text-xs font-bold">
                  {lim}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Booking ID
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Type
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Detail & Route
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Total / Cost (User · Provider · USD)
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Contact
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Booking Date
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookingsQuery.isLoading || bookingsQuery.isFetching ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell className="py-3">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-5 w-16 bg-muted rounded-full animate-pulse"></div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-28 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="h-5 w-16 bg-muted rounded-full animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : !bookingsQuery.data || bookingsQuery.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-xs text-muted-foreground"
                >
                  No matching bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookingsQuery.data.map((b: any, idx: number) => {
                const ref =
                  b.confirmationCode ||
                  (b.id && typeof b.id === "string"
                    ? b.id.slice(0, 8).toUpperCase()
                    : "");
                return (
                  <TableRow
                    key={b.id || idx}
                    className="hover:bg-muted/30 transition-colors border-border"
                  >
                    <TableCell className="py-3 text-xs font-bold text-foreground">
                      {ref}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold capitalize",
                          typeColors[b.type] ?? typeColors.flight,
                        )}
                      >
                        {b.type || "flight"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-xs font-bold text-foreground leading-tight">
                        {b.title}
                      </p>
                      {b.subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-none">
                          {b.subtitle}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <BookingAmountCell
                        total={Number(b.total) || 0}
                        currency={b.currency}
                        defaultCurrency={b.defaultCurrency}
                      />
                    </TableCell>
                    <TableCell className="py-3 text-xs text-foreground font-medium">
                      {b.userEmail || "—"}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-foreground font-medium">
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold capitalize",
                          stColors[b.status] ?? stColors.pending,
                        )}
                      >
                        {b.status || "pending"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {(page > 1 || (bookingsQuery.data?.length ?? 0) >= limit) && (
        <div className="flex items-center justify-between mt-4">
          <Button
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            variant="outline"
            className="rounded-xl font-bold h-9 text-xs border border-border"
          >
            ← Previous
          </Button>
          <span className="text-xs font-bold text-muted-foreground select-none">
            Page {page}
          </span>
          <Button
            disabled={!bookingsQuery.data || bookingsQuery.data.length < limit}
            onClick={() => setPage((prev) => prev + 1)}
            variant="outline"
            className="rounded-xl font-bold h-9 text-xs border border-border"
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
