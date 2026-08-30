"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorldrixMeta,
  listWorldrix,
  createWorldrix,
  updateWorldrix,
  deleteWorldrix,
  WorldrixRow,
  WorldrixTableMeta,
} from "@/lib/api/admin-api";
import { AdminDataTable, ConfirmDialog } from "./AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LIMIT = 20;

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function AdminWorldrixTable({ resource }: { resource: string }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<WorldrixRow | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: string | number | null;
  }>({
    isOpen: false,
    id: null,
  });

  const metaQuery = useQuery({
    queryKey: ["worldrix-meta"],
    queryFn: getWorldrixMeta,
    staleTime: 5 * 60 * 1000,
  });

  const meta: WorldrixTableMeta | undefined = useMemo(
    () => metaQuery.data?.find((m) => m.resource === resource),
    [metaQuery.data, resource],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["worldrix", resource, page],
    queryFn: () => listWorldrix(resource, page, LIMIT),
    placeholderData: (prev) => prev,
    enabled: Boolean(meta),
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["worldrix", resource] });

  const createMutation = useMutation({
    mutationFn: (body: WorldrixRow) => createWorldrix(resource, body),
    onSuccess: () => {
      invalidate();
      setIsAddOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string | number; body: WorldrixRow }) =>
      updateWorldrix(resource, id, body),
    onSuccess: () => {
      invalidate();
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteWorldrix(resource, id),
    onSuccess: () => {
      invalidate();
      setConfirmDelete({ isOpen: false, id: null });
    },
  });

  if (metaQuery.isLoading) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
        Loading…
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
        Unknown table: {resource}
      </div>
    );
  }

  const columns = meta.columns;

  const tableActions = (
    <Button
      size="sm"
      variant="outline"
      className="rounded-2xl h-9 px-4 gap-1 shadow-sm text-xs"
      onClick={() => setIsAddOpen(true)}
    >
      <Plus className="h-4 w-4" /> Add Row
    </Button>
  );

  return (
    <>
      <AdminDataTable
        title={meta.label}
        subtitle="Manage CRM configuration entries"
        totalCount={total}
        totalLabel="Total entries"
        isLoading={isLoading}
        headers={[...columns, "Action"]}
        actions={tableActions}
        hasRows={rows.length > 0}
        emptyMessage="No rows found."
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          isFetching,
        }}
      >
        {rows.map((row, i) => (
          <tr
            key={String(row[meta.pk] ?? i)}
            className="border-t border-border/60 hover:bg-muted/30 transition-colors"
          >
            {columns.map((c) => (
              <td
                key={c}
                className="px-3 py-2 max-w-[280px] truncate"
                title={displayValue(row[c])}
              >
                {displayValue(row[c])}
              </td>
            ))}
            <td className="px-3 py-2 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(row)}
                  className="text-primary hover:text-primary/80"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setConfirmDelete({ isOpen: true, id: row[meta.pk] as string | number });
                  }}
                  className="text-destructive hover:text-destructive/80 disabled:opacity-40"
                  disabled={deleteMutation.isPending}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminDataTable>

      {/* Add dialog */}
      <RowDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title={`Add ${meta.label}`}
        fields={meta.writable}
        initial={{}}
        isLoading={createMutation.isPending}
        onSubmit={(body) => createMutation.mutate(body)}
      />

      {/* Edit dialog */}
      <RowDialog
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        title={`Edit ${meta.label}`}
        fields={meta.writable}
        initial={editing ?? {}}
        isLoading={updateMutation.isPending}
        onSubmit={(body) =>
          editing &&
          updateMutation.mutate({
            id: editing[meta.pk] as string | number,
            body,
          })
        }
      />

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, isOpen: open }))}
        onConfirm={() => {
          if (confirmDelete.id !== null) deleteMutation.mutate(confirmDelete.id);
        }}
        message="Are you sure you want to delete this row?"
      />
    </>
  );
}

function RowDialog({
  open,
  onOpenChange,
  title,
  fields,
  initial,
  isLoading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: string[];
  initial: WorldrixRow;
  isLoading: boolean;
  onSubmit: (body: WorldrixRow) => void;
}) {
  const [form, setForm] = useState<Record<string, string>>({});

  // Reset form whenever the dialog is (re)opened with new initial data.
  const initialKey = JSON.stringify(initial);
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = initial[f];
      next[f] = v === null || v === undefined ? "" : String(v);
    }
    setForm(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey, open]);

  const handleSubmit = () => {
    const body: WorldrixRow = {};
    for (const f of fields) {
      const raw = form[f];
      if (raw !== undefined && raw !== "") body[f] = raw;
    }
    onSubmit(body);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl border border-border bg-card/95 backdrop-blur-xl p-6 shadow-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {fields.map((f) => (
            <div key={f} className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {f}
              </Label>
              <Input
                className="rounded-2xl h-11 text-sm"
                value={form[f] ?? ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [f]: e.target.value }))
                }
              />
            </div>
          ))}
          <div className="col-span-full flex justify-end gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="rounded-2xl h-11 px-6 shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
