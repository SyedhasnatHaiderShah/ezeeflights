"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUsaMarkup,
  createUsaMarkup,
  updateUsaMarkup,
  deleteUsaMarkup,
  UsaMarkupRow,
  CreateUsaMarkupDto,
  getUsaMarkupStatus,
  updateUsaMarkupStatus,
} from "@/lib/api/admin-api";
import { AdminDataTable, ConfirmDialog } from "./AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  JetcostAddRuleModal,
  blankJetcostForm,
  flightToJetcostForm,
  formatMarkupDate,
  parseMarkupDate,
  MARKUP_TYPES,
  CABIN_CLASSES,
  JOURNEY_TYPES,
  AmountInput,
} from "./JetcostAddRuleModal";
import { resolveAirlineName } from "@/lib/utils/airline-names";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2 } from "lucide-react";

const LIMIT = 10;
type RowEdit = Partial<UsaMarkupRow>;

export function AdminSpanishJetcost() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [rowEdits, setRowEdits] = useState<Record<number, RowEdit>>({});

  const statusQuery = useQuery({
    queryKey: ["usa-markup-status"],
    queryFn: getUsaMarkupStatus,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateUsaMarkupStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usa-markup-status"] });
    },
  });

  const currentStatus = statusQuery.data?.status ?? "Stop";
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] =
    useState<CreateUsaMarkupDto>(blankJetcostForm());
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefillRaw = localStorage.getItem("prefill_spanish_jetcost");
      if (prefillRaw) {
        try {
          const flight = JSON.parse(prefillRaw);
          localStorage.removeItem("prefill_spanish_jetcost");
          const form = flightToJetcostForm(flight);
          setAddForm(form);
          setIsPrefilled(true);
          setIsAddOpen(true);
        } catch (e) {
          console.error("Failed to parse spanish jetcost prefill", e);
        }
      }
    }
  }, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["usa-markup", page],
    queryFn: () => listUsaMarkup(page, LIMIT),
    placeholderData: (prev) => prev,
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: RowEdit }) =>
      updateUsaMarkup(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usa-markup"] });
      setRowEdits({});
      setCheckedIds(new Set());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUsaMarkup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usa-markup"] });
      setCheckedIds(new Set());
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateUsaMarkupDto) => createUsaMarkup(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usa-markup"] });
      setIsAddOpen(false);
      setIsPrefilled(false);
      setAddForm(blankJetcostForm());
    },
  });

  const handleCheck = (id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCheckAll = () => {
    if (checkedIds.size === rows.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(rows.map((r) => r.Id)));
    }
  };

  const setField = useCallback(
    (id: number, field: keyof UsaMarkupRow, value: string | number) => {
      setRowEdits((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? {}), [field]: value },
      }));
    },
    [],
  );

  const handleBulkUpdate = () => {
    const ids =
      checkedIds.size > 0 ? [...checkedIds] : Object.keys(rowEdits).map(Number);
    ids.forEach((id) => {
      const edit = rowEdits[id];
      if (edit && Object.keys(edit).length > 0) {
        updateMutation.mutate({ id, body: edit });
      }
    });
  };

  const handleBulkDelete = () => {
    const ids = [...checkedIds];
    if (ids.length === 0) return;
    setConfirmDelete({
      isOpen: true,
      message: `Are you sure you want to delete ${ids.length} rule(s)?`,
      onConfirm: () => ids.forEach((id) => deleteMutation.mutate(id)),
    });
  };

  const handleSingleDelete = (id: number) => {
    setConfirmDelete({
      isOpen: true,
      message: "Are you sure you want to delete this markup rule?",
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const pageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (page > 5) pages.push("...");
      const around = [page - 1, page, page + 1].filter(
        (p) => p > 3 && p < totalPages - 2,
      );
      pages.push(...around);
      if (page < totalPages - 4) pages.push("...");
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    }
    return [...new Set(pages)];
  };

  const isBusy =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    createMutation.isPending;

  const tableActions = (
    <>
      <div className="flex items-center gap-2 mr-3 bg-muted/40 border border-border px-3.5 py-1.5 rounded-2xl shadow-sm h-9">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Discount Status:
        </span>
        <span
          className={cn(
            "text-xs font-bold transition-all",
            currentStatus === "Start" ? "text-emerald-500" : "text-amber-500",
          )}
        >
          {currentStatus === "Start" ? "Running" : "Stopped"}
        </span>
        <Switch
          id="jetcost-status-switch"
          checked={currentStatus === "Start"}
          onCheckedChange={(checked) => {
            statusMutation.mutate(checked ? "Start" : "Stop");
          }}
          disabled={statusQuery.isLoading || statusMutation.isPending}
          className="scale-90"
        />
      </div>
      <Button
        size="sm"
        className="rounded-2xl h-9 px-4 shadow-sm"
        onClick={handleBulkUpdate}
        disabled={isBusy || Object.keys(rowEdits).length === 0}
      >
        {updateMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Update"
        )}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="rounded-2xl h-9 px-4 shadow-sm"
        onClick={handleBulkDelete}
        disabled={isBusy || checkedIds.size === 0}
      >
        {deleteMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Delete"
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-2xl h-9 px-4 gap-1 shadow-sm"
        onClick={() => {
          setAddForm(blankJetcostForm());
          setIsPrefilled(false);
          setIsAddOpen(true);
        }}
      >
        <Plus className="h-4 w-4" /> Add Rule
      </Button>
      <JetcostAddRuleModal
        isOpen={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setIsPrefilled(false);
            setAddForm(blankJetcostForm());
          }
        }}
        initialForm={addForm}
        isPrefilled={isPrefilled}
        onSuccess={() => {
          setIsPrefilled(false);
          setAddForm(blankJetcostForm());
        }}
      />
    </>
  );

  return (
    <>
      <AdminDataTable
        title="Spanish Jetcost"
        subtitle="Page of rules details"
        totalCount={total}
        totalLabel="Total rules"
        isLoading={isLoading}
        headers={[
          "User Name",
          "Source",
          "Destination",
          "Airline",
          "Start Date",
          "End Date",
          "Markup Type",
          "Cabin Class",
          "Journey Type",
          "Adult",
          "Child",
          "Infant",
          "Action",
        ]}
        actions={tableActions}
        onCheckAll={handleCheckAll}
        isAllChecked={checkedIds.size === rows.length && rows.length > 0}
        hasRows={rows.length > 0}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          isFetching,
        }}
      >
        {rows.map((row) => {
          const edit = rowEdits[row.Id] ?? {};
          const val = <K extends keyof UsaMarkupRow>(k: K) =>
            (edit[k] !== undefined ? edit[k] : row[k]) as any;

          return (
            <tr
              key={row.Id}
              className={cn(
                "border-t border-border/60 transition-colors",
                checkedIds.has(row.Id) ? "bg-primary/5" : "hover:bg-muted/30",
              )}
            >
              <td className="px-2 py-1.5 text-center">
                <Checkbox
                  checked={checkedIds.has(row.Id)}
                  onCheckedChange={() => handleCheck(row.Id)}
                  variant="ios"
                  className="mx-auto"
                />
              </td>
              <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">
                {row.userName ?? "—"}
              </td>
              <td className="px-1 py-1.5">
                <Input
                  className="h-7 w-14 text-xs px-1.5 rounded-lg"
                  value={val("source")}
                  onChange={(e) =>
                    setField(row.Id, "source", e.target.value.toUpperCase())
                  }
                />
              </td>
              <td className="px-1 py-1.5">
                <Input
                  className="h-7 w-14 text-xs px-1.5 rounded-lg"
                  value={val("destination")}
                  onChange={(e) =>
                    setField(
                      row.Id,
                      "destination",
                      e.target.value.toUpperCase(),
                    )
                  }
                />
              </td>
              <td
                className="px-1 py-1.5"
                title={resolveAirlineName(val("airline"))}
              >
                <Input
                  className="h-7 w-14 text-xs px-1.5 rounded-lg"
                  value={val("airline")}
                  onChange={(e) =>
                    setField(row.Id, "airline", e.target.value.toUpperCase())
                  }
                />
              </td>
              <td className="px-1 py-1.5">
                <Input
                  className="h-7 w-28 text-xs px-1.5 rounded-lg"
                  placeholder="MM/DD/YYYY"
                  value={val("startDate")}
                  onChange={(e) =>
                    setField(row.Id, "startDate", e.target.value)
                  }
                />
              </td>
              <td className="px-1 py-1.5">
                <Input
                  className="h-7 w-28 text-xs px-1.5 rounded-lg"
                  placeholder="MM/DD/YYYY"
                  value={val("endDate")}
                  onChange={(e) => setField(row.Id, "endDate", e.target.value)}
                />
              </td>
              <td className="px-1 py-1.5">
                <Select
                  value={val("markupType")}
                  onValueChange={(v) => setField(row.Id, "markupType", v)}
                >
                  <SelectTrigger className="h-7 w-28 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKUP_TYPES.map((t: string) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-1 py-1.5">
                <Select
                  value={val("cabinClass")}
                  onValueChange={(v) => setField(row.Id, "cabinClass", v)}
                >
                  <SelectTrigger className="h-7 w-32 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CABIN_CLASSES.map((c: string) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-1 py-1.5">
                <Select
                  value={val("journeyType")}
                  onValueChange={(v) => setField(row.Id, "journeyType", v)}
                >
                  <SelectTrigger className="h-7 w-24 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOURNEY_TYPES.map((j: string) => (
                      <SelectItem key={j} value={j} className="text-xs">
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-1 py-1.5">
                <AmountInput
                  className="h-7 w-16 text-xs px-1.5 rounded-lg"
                  value={Number(val("adultAmount"))}
                  onChange={(n: number) => setField(row.Id, "adultAmount", n)}
                />
              </td>
              <td className="px-1 py-1.5">
                <AmountInput
                  className="h-7 w-16 text-xs px-1.5 rounded-lg"
                  value={Number(val("childAmount"))}
                  onChange={(n: number) => setField(row.Id, "childAmount", n)}
                />
              </td>
              <td className="px-1 py-1.5">
                <AmountInput
                  className="h-7 w-16 text-xs px-1.5 rounded-lg"
                  value={Number(val("infantAmount"))}
                  onChange={(n: number) => setField(row.Id, "infantAmount", n)}
                />
              </td>
              <td className="px-2 py-1.5 text-center">
                <button
                  onClick={() => handleSingleDelete(row.Id)}
                  className="text-destructive hover:text-destructive/80 disabled:opacity-40"
                  disabled={isBusy}
                  title="Delete rule"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          );
        })}
      </AdminDataTable>
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onOpenChange={(open) =>
          setConfirmDelete((prev) => ({ ...prev, isOpen: open }))
        }
        onConfirm={confirmDelete.onConfirm}
        message={confirmDelete.message}
      />
    </>
  );
}
