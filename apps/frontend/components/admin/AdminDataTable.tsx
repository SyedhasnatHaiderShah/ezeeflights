"use client";

import React from "react";
import { Loader2, ChevronFirst, ChevronLeft, ChevronRight, ChevronLast } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface AdminDataTableProps {
  title: string;
  subtitle: string;
  totalCount: number;
  totalLabel?: string;
  isLoading: boolean;
  emptyMessage?: string;
  headers: string[];
  actions?: React.ReactNode;
  onCheckAll?: () => void;
  isAllChecked?: boolean;
  hasRows: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isFetching?: boolean;
  };
  children: React.ReactNode;
}

export function AdminDataTable({
  title,
  subtitle,
  totalCount,
  totalLabel = "Total items",
  isLoading,
  emptyMessage = "No items found.",
  headers,
  actions,
  onCheckAll,
  isAllChecked = false,
  hasRows,
  pagination,
  children,
}: AdminDataTableProps) {
  
  const pageNumbers = () => {
    if (!pagination) return [];
    const { page, totalPages } = pagination;
    const pages: (number | "...")[] = [];
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (page > 5) pages.push("...");
      const around = [page - 1, page, page + 1].filter((p) => p > 3 && p < totalPages - 2);
      pages.push(...around);
      if (page < totalPages - 4) pages.push("...");
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  const totalCols = headers.length + (onCheckAll ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Top Bar with Stats Header and Custom Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold text-foreground">
            {totalLabel}: <span className="text-primary">{totalCount}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2 items-center">{actions}</div>}
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              {onCheckAll && (
                <th className="px-2 py-2.5 text-center w-8">
                  <Checkbox
                    checked={isAllChecked}
                    onCheckedChange={onCheckAll}
                    variant="ios"
                    className="mx-auto"
                  />
                </th>
              )}
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-2 py-2.5 whitespace-nowrap text-left text-[10px] font-bold uppercase tracking-wider text-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={totalCols} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
                  Loading…
                </td>
              </tr>
            ) : !hasRows ? (
              <tr>
                <td colSpan={totalCols} className="py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="flex items-center justify-center gap-1 text-xs flex-wrap mt-4">
          <button
            onClick={() => pagination.onPageChange(1)}
            disabled={pagination.page === 1 || pagination.isFetching}
            className="px-2.5 py-1.5 rounded-xl hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronFirst className="h-3 w-3 inline" /> First
          </button>
          <button
            onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1 || pagination.isFetching}
            className="px-2.5 py-1.5 rounded-xl hover:bg-muted disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-3 w-3 inline" /> Previous
          </button>

          {pageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => pagination.onPageChange(p as number)}
                className={cn(
                  "px-2.5 py-1.5 rounded-xl min-w-[28px] transition-colors",
                  pagination.page === p
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "hover:bg-muted",
                )}
              >
                {p}
              </button>
            ),
          )}

          <button
            onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
            disabled={pagination.page === pagination.totalPages || pagination.isFetching}
            className="px-2.5 py-1.5 rounded-xl hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight className="h-3 w-3 inline" />
          </button>
          <button
            onClick={() => pagination.onPageChange(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages || pagination.isFetching}
            className="px-2.5 py-1.5 rounded-xl hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Last <ChevronLast className="h-3 w-3 inline" />
          </button>
          <span className="text-muted-foreground ml-2">{pagination.totalPages}</span>
        </div>
      )}
    </div>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  message: string;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Confirm Action",
  message,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2rem] border border-border bg-card/95 backdrop-blur-xl p-6 shadow-xl z-[300]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-destructive">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-2xl h-9 px-4"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-2xl h-9 px-4"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
