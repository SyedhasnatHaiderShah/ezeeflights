"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Inbox, LayoutGrid, List } from "lucide-react";
import { CancelBookingDialog } from "@/components/ui/cancel-booking-dialog";
import { useLoadingStore } from "@/lib/store/use-loading-store";
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

interface AdminPendingBookingsProps {
  onRefetch?: () => void;
}

export function AdminPendingBookings({ onRefetch }: AdminPendingBookingsProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const { startLoading, stopLoading } = useLoadingStore();

  const inquiriesQuery = useQuery({
    queryKey: ["admin-inquiries-dashboard", page, limit],
    queryFn: () =>
      adminFetch<any[]>(`/bookings?limit=${limit}&page=${page}&tab=pending`),
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

  const handleAction = async (
    id: string,
    status: string,
    actionLabel: string,
  ) => {
    startLoading(`${actionLabel}...`);
    try {
      await adminFetch(`/bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      inquiriesQuery.refetch();
      if (onRefetch) onRefetch();
    } catch (err) {
      console.error(err);
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-wider">
            Pending Bookings
          </h3>
          <p className="text-xs text-foreground font-semibold tracking-widest mt-1">
            {inquiriesQuery.isLoading
              ? "Fetching data..."
              : `Showing ${inquiriesQuery.data?.length || 0} pending items`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center transition-all border",
                viewMode === "list"
                  ? "bg-redmix text-white border-redmix shadow-md"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center transition-all border",
                viewMode === "card"
                  ? "bg-redmix text-white border-redmix shadow-md"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
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
      </div>

      {inquiriesQuery.isLoading || inquiriesQuery.isFetching ? (
        viewMode === "card" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl shadow-sm h-[280px] p-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 w-16 bg-muted rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                  <div className="space-y-2 mt-4">
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 w-2/3 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 w-1/3 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-border mt-4">
                  <div className="h-8 flex-1 bg-muted rounded-xl animate-pulse"></div>
                  <div className="h-8 flex-1 bg-muted rounded-xl animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">Booking ID</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">Type</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">Detail & Route</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">Total / Cost</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">Contact</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell className="py-3"><div className="h-4 w-20 bg-muted rounded animate-pulse"></div></TableCell>
                    <TableCell className="py-3"><div className="h-5 w-16 bg-muted rounded-full animate-pulse"></div></TableCell>
                    <TableCell className="py-3"><div className="h-4 w-32 bg-muted rounded animate-pulse mb-2"></div><div className="h-3 w-24 bg-muted rounded animate-pulse"></div></TableCell>
                    <TableCell className="py-3"><div className="h-4 w-20 bg-muted rounded animate-pulse"></div></TableCell>
                    <TableCell className="py-3"><div className="h-4 w-28 bg-muted rounded animate-pulse"></div></TableCell>
                    <TableCell className="py-3 text-right"><div className="h-8 w-32 bg-muted rounded-lg animate-pulse ml-auto"></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (inquiriesQuery.data?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
          <Inbox className="h-8 w-8 opacity-30" />
          <p className="text-sm font-medium">No pending items.</p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(inquiriesQuery.data ?? []).map((inq) => {
            const ref =
              inq.confirmationCode ||
              (inq.id && typeof inq.id === "string"
                ? inq.id.slice(0, 8).toUpperCase()
                : "");
            return (
              <div
                key={inq.id}
                className="group bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-[280px]"
              >
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {ref}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold rounded-lg border uppercase",
                        typeColors[inq.type] ?? typeColors.flight,
                      )}
                    >
                      {inq.type || "flight"}
                    </span>
                  </div>
                  <div className="font-semibold text-foreground text-sm uppercase mb-2">
                    {inq.title}
                  </div>
                  <div className="text-xs font-bold text-muted-foreground space-y-1">
                    {inq.subtitle && <p>{inq.subtitle}</p>}
                    <p className="truncate">{inq.userEmail || "Anonymous"}</p>
                    <BookingAmountCell
                      total={Number(inq.total) || 0}
                      currency={inq.currency}
                      defaultCurrency={inq.defaultCurrency}
                    />
                  </div>
                </div>
                <div className="p-4 bg-muted/30 border-t border-border flex gap-2">
                  <CancelBookingDialog
                    title="Confirm Booking"
                    description="Are you sure you want to confirm this booking?"
                    confirmText="Confirm"
                    onConfirm={() =>
                      handleAction(inq.id, "confirmed", "Confirming")
                    }
                    trigger={
                      <button className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase transition">
                        Confirm
                      </button>
                    }
                  />
                  <CancelBookingDialog
                    title="Cancel Booking"
                    description="Are you sure you want to cancel this booking?"
                    confirmText="Yes, Cancel"
                    onConfirm={() =>
                      handleAction(inq.id, "cancelled", "Cancelling")
                    }
                    trigger={
                      <button className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase transition">
                        Cancel
                      </button>
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
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
                <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(inquiriesQuery.data ?? []).map((inq) => {
                const ref =
                  inq.confirmationCode ||
                  (inq.id && typeof inq.id === "string"
                    ? inq.id.slice(0, 8).toUpperCase()
                    : "");
                return (
                  <TableRow
                    key={inq.id}
                    className="hover:bg-muted/30 transition-colors border-border"
                  >
                    <TableCell className="py-3">
                      <span className="font-mono font-semibold text-foreground text-xs">
                        {ref}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold capitalize",
                          typeColors[inq.type] ?? typeColors.flight,
                        )}
                      >
                        {inq.type || "flight"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="font-bold text-foreground text-xs leading-tight">
                        {inq.title}
                      </p>
                      {inq.subtitle && (
                        <p className="text-xs text-muted-foreground mt-1 leading-none">
                          {inq.subtitle}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <BookingAmountCell
                        total={Number(inq.total) || 0}
                        currency={inq.currency}
                        defaultCurrency={inq.defaultCurrency}
                      />
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="font-semibold text-foreground text-xs">
                        {inq.userEmail || "Anonymous"}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CancelBookingDialog
                          title="Confirm Booking"
                          description="Are you sure you want to confirm this booking?"
                          confirmText="Confirm"
                          onConfirm={() =>
                            handleAction(inq.id, "confirmed", "Confirming")
                          }
                          trigger={
                            <button className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition">
                              Confirm
                            </button>
                          }
                        />
                        <CancelBookingDialog
                          title="Cancel Booking"
                          description="Are you sure you want to cancel this booking?"
                          confirmText="Yes, Cancel"
                          onConfirm={() =>
                            handleAction(inq.id, "cancelled", "Cancelling")
                          }
                          trigger={
                            <button className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition">
                              Cancel
                            </button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {(page > 1 || (inquiriesQuery.data?.length ?? 0) >= limit) && (
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
            disabled={
              !inquiriesQuery.data || inquiriesQuery.data.length < limit
            }
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
