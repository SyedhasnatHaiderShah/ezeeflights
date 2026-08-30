"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listHoldDestinations,
  createHoldDestination,
  deleteHoldDestination,
} from "@/lib/api/admin-api";
import { AdminDataTable, ConfirmDialog } from "./AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminHoldDestinations() {
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["hold-destinations"],
    queryFn: listHoldDestinations,
  });

  const rows = data ?? [];

  const createMutation = useMutation({
    mutationFn: (code: string) => createHoldDestination(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hold-destinations"] });
      setValue("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteHoldDestination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hold-destinations"] });
      setConfirmDelete({ isOpen: false, id: null, name: "" });
    },
  });

  const handleAdd = () => {
    const code = value.trim().toUpperCase();
    if (!code) return;
    createMutation.mutate(code);
  };

  const tableActions = (
    <>
      <Input
        className="rounded-2xl h-9 w-40 text-sm uppercase"
        placeholder="e.g. DXB"
        maxLength={10}
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
      <Button
        size="sm"
        className="rounded-2xl h-9 px-4 gap-1 shadow-sm"
        onClick={handleAdd}
        disabled={createMutation.isPending || !value.trim()}
      >
        {createMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Add
      </Button>
    </>
  );

  return (
    <>
      <AdminDataTable
        title="Held destinations"
        subtitle="Destinations parked / paused from the live API"
        totalCount={rows.length}
        totalLabel="Held destinations"
        isLoading={isLoading}
        headers={["ID", "Destination", "Action"]}
        actions={tableActions}
        hasRows={rows.length > 0}
        emptyMessage="No held destinations."
      >
        {rows.map((row) => (
          <tr
            key={row.hold_des_id}
            className={cn(
              "border-t border-border/60 transition-colors hover:bg-muted/30",
            )}
          >
            <td className="px-3 py-2 text-muted-foreground">
              {row.hold_des_id}
            </td>
            <td className="px-3 py-2 font-semibold uppercase">
              {row.hold_destination ?? "—"}
            </td>
            <td className="px-3 py-2">
              <button
                onClick={() => {
                  setConfirmDelete({
                    isOpen: true,
                    id: row.hold_des_id,
                    name: row.hold_destination ?? "",
                  });
                }}
                className="text-destructive hover:text-destructive/80 disabled:opacity-40"
                disabled={deleteMutation.isPending}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </AdminDataTable>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, isOpen: open }))}
        onConfirm={() => {
          if (confirmDelete.id !== null) deleteMutation.mutate(confirmDelete.id);
        }}
        message={`Are you sure you want to remove ${confirmDelete.name}?`}
      />
    </>
  );
}
