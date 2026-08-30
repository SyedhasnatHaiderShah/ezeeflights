"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/admin-api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AdminWishlistsProps {
  onRefetch?: () => void;
}

export function AdminWishlists({ onRefetch }: AdminWishlistsProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const wishlistsQuery = useQuery({
    queryKey: ["admin-wishlists", page, limit],
    queryFn: () =>
      adminFetch<any[]>(`/wishlists/all?limit=${limit}&page=${page}`),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            User Wishlists & Saved Items
          </h3>
          <p className="text-xs text-muted-foreground">
            Monitor what users are saving for later
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
                <SelectItem
                  key={lim}
                  value={lim.toString()}
                  className="text-xs font-bold"
                >
                  {lim}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Item ID
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Type
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Detail & Route
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Total / Cost
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                User
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">
                Saved At
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wishlistsQuery.isLoading || wishlistsQuery.isFetching ? (
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
                </TableRow>
              ))
            ) : !wishlistsQuery.data || wishlistsQuery.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-xs text-muted-foreground"
                >
                  No wishlist items found.
                </TableCell>
              </TableRow>
            ) : (
              wishlistsQuery.data.map((w: any) => {
                const ref = `WSH-${w.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
                const type =
                  w.entityType === "flights"
                    ? "flight"
                    : w.entityType === "hotels"
                      ? "hotel"
                      : w.entityType;

                // Map details based on type
                let title = "Saved Item";
                let subtitle = "";
                let total = 0;
                let currency = "USD";

                if (w.entityType === "flights" && w.data) {
                  const outbound = w.data.outbound || [];
                  if (outbound.length > 0) {
                    title = `${outbound[0].fromAirport?.code || "—"} → ${outbound[outbound.length - 1].toAirport?.code || "—"}`;
                    subtitle = `${format(new Date(outbound[0].departureDate), "yyyy-MM-dd")} • ${outbound[0].cabinClass || "Economy"}`;
                  }
                  total = w.data.totalCost || 0;
                  currency = w.data.currency || "USD";
                } else if (w.entityType === "hotels" && w.data) {
                  title = w.data.hotelName || "Hotel";
                  subtitle = `${w.data.city || ""}, ${w.data.country || ""}`;
                  total = w.data.totalPrice || 0;
                  currency = w.data.currency || "USD";
                } else if (w.entityType === "packages" && w.data) {
                  title = w.data.title || "Travel Package";
                  subtitle = `${w.data.destination || ""}${w.data.country ? `, ${w.data.country}` : ""}`;
                  total = w.data.basePrice || 0;
                  currency = w.data.currency || "USD";
                } else if (w.entityType === "flight_deals" && w.data) {
                  title = w.data.title || "Flight Deal";
                  subtitle = `${w.data.originCity || ""} → ${w.data.destinationCity || ""}`;
                  total = w.data.price || 0;
                  currency = "USD";
                } else if (w.entityType === "attractions" && w.data) {
                  title = w.data.name || w.data.title || "Attraction";
                  subtitle = w.data.category || "";
                  total = w.data.entryFee || w.data.price || 0;
                  currency = w.data.currency || "USD";
                } else if (w.entityType === "attractions" && w.data) {
                  title = w.data.name || w.data.title || "Attraction";
                  subtitle = w.data.category || "";
                  total = w.data.entryFee || w.data.price || 0;
                  currency = w.data.currency || "USD";
                } else {
                  title = w.data?.name || w.data?.title || w.entityId;
                  subtitle = w.data?.subtitle || w.data?.destination || "";
                  total =
                    w.data?.total ||
                    w.data?.basePrice ||
                    w.data?.price ||
                    w.data?.entryFee ||
                    0;
                  currency = w.data?.currency || "USD";
                }

                if (w.data?.userSelectedCurrency) {
                  currency = w.data.userSelectedCurrency;
                  total = w.data.userConvertedCost ?? total;
                }

                return (
                  <TableRow
                    key={w.id}
                    className="hover:bg-muted/30 transition-colors border-border"
                  >
                    <TableCell className="py-3 font-bold text-foreground text-xs">
                      {ref}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold capitalize",
                          type === "flight"
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : type === "hotel"
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : type === "packages"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : type === "flight_deals"
                                  ? "bg-rose-50 text-rose-600 border-rose-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200",
                        )}
                      >
                        {type}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-xs font-bold text-foreground leading-tight">
                        {title}
                      </p>
                      {subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-none">
                          {subtitle}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-xs font-bold text-foreground">
                      {currency} {total.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 text-xs font-medium text-foreground">
                      {w.userEmail || "Guest"}
                    </TableCell>
                    <TableCell className="py-3 text-xs font-medium text-muted-foreground">
                      {format(new Date(w.createdAt), "MMM d, HH:mm")}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {(page > 1 || (wishlistsQuery.data?.length ?? 0) >= limit) && (
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
              !wishlistsQuery.data || wishlistsQuery.data.length < limit
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
